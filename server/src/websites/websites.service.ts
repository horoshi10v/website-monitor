import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { Website, WebsiteDocument } from './websites.schema';
import {Setting, SettingDocument} from "./settings.schema";
import * as nodemailer from 'nodemailer';

@Injectable()
export class WebsitesService implements OnModuleInit, OnModuleDestroy {
    private nextCheckTimeoutId: NodeJS.Timeout | null = null;
    private emailTo: string | null = null;

    constructor(
        @InjectModel(Website.name) private websiteModel: Model<WebsiteDocument>,
        @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
    ) {}

    async onModuleInit() {
        let setting = await this.settingModel.findOne();
        if (!setting) {
            setting = new this.settingModel({ emailTo: '' });
            await setting.save();
        }
        this.emailTo = setting.emailTo || null;
        this.scheduleNextCheck();
    }

    onModuleDestroy() {
        if (this.nextCheckTimeoutId) {
            clearTimeout(this.nextCheckTimeoutId);
        }
    }

    async setEmailTo(email: string) {
        this.emailTo = email;
        let setting = await this.settingModel.findOne();
        if (!setting) {
            setting = new this.settingModel({ emailTo: email });
        } else {
            setting.emailTo = email;
        }
        await setting.save();
    }

    public async scheduleNextCheck() {
        const websites = await this.websiteModel.find();
        const now = Date.now();

        let earliestNextCheck = Infinity;

        for (const site of websites) {
            const lastCheckedTime = site.lastChecked ? site.lastChecked.getTime() : 0;
            const intervalMs = site.interval * 60000;
            const nextCheckTime = lastCheckedTime + intervalMs;
            if (nextCheckTime < earliestNextCheck) {
                earliestNextCheck = nextCheckTime;
            }
        }

        if (earliestNextCheck === Infinity) {
            return;
        }

        const delay = earliestNextCheck - now;
        if (delay <= 0) {
            await this.runCheck();
        } else {
            this.nextCheckTimeoutId = setTimeout(async () => {
                await this.runCheck();
            }, delay);
        }
    }

    private async runCheck() {
        this.nextCheckTimeoutId = null;
        const now = Date.now();
        const websites = await this.websiteModel.find();

        for (const site of websites) {
            const lastCheckedTime = site.lastChecked ? site.lastChecked.getTime() : 0;
            const intervalMs = site.interval * 60000;
            if (now - lastCheckedTime >= intervalMs) {
                const result = await this.checkWebsite(site.url);
                site.status = result.status;
                site.lastChecked = new Date();
                await site.save();

                if (!site.status.includes('200')) {
                    await this.sendAlertEmail(site);
                }
            }
        }

        await this.scheduleNextCheck();
    }

    async checkWebsite(url: string): Promise<{ url: string; status: string }> {
        if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
        }
        try {
            const response = await axios.get(url, { timeout: 5000 });
            return { url, status: `Up (${response.status})` };
        } catch (error) {
            return { url, status: 'Down or Unreachable' };
        }
    }

    async checkOneWebsite(url: string): Promise<Website> {
        const website = await this.websiteModel.findOne({ url });
        if (!website) {
            return null;
        }
        const result = await this.checkWebsite(website.url);
        website.status = result.status;
        website.lastChecked = new Date();
        await website.save();

        if (!website.status.includes('200')) {
            await this.sendAlertEmail(website);
        }

        await this.scheduleNextCheck();
        return website;
    }

    async saveWebsite(url: string, interval: number): Promise<Website> {
        const existingWebsite = await this.websiteModel.findOne({ url });
        if (existingWebsite) {
            return existingWebsite;
        }
        const website = new this.websiteModel({ url, interval });
        const saved = await website.save();
        await this.scheduleNextCheck();
        return saved;
    }

    async checkWebsites(): Promise<void> {
        const websites = await this.websiteModel.find();
        for (const site of websites) {
            const result = await this.checkWebsite(site.url);
            site.status = result.status;
            site.lastChecked = new Date();
            await site.save();

            if (!site.status.includes('200')) {
                await this.sendAlertEmail(site);
            }
        }
        await this.scheduleNextCheck();
    }

    async getWebsites(): Promise<Website[]> {
        return this.websiteModel.find();
    }

    async deleteWebsite(url: string): Promise<void> {
        await this.websiteModel.deleteOne({ url });
        await this.scheduleNextCheck();
    }

    async getEmailTo(): Promise<string | null> {
        return this.emailTo;
    }

    private async sendAlertEmail(site: Website) {
        if (!this.emailTo) return;

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: this.emailTo,
            subject: `🚨 Alert: Website Down - ${site.url}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #d9534f;">🚨 Website Down Alert</h2>
                    <p>The following website has returned a <strong>non-200 status</strong> during the latest check:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>🔗 URL:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${site.url}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>⚠️ Status:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd; color: #d9534f;"><strong>${site.status}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>⏱️ Last Checked:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${site.lastChecked.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>🔄 Interval:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${site.interval} minutes</td>
                        </tr>
                    </table>
                    <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #777;">
                        This is an automated email from the Website Healthcheck Monitor system.<br/>
                        Do not reply to this email.
                    </p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Alert email sent to ${this.emailTo} for site ${site.url}`);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}
