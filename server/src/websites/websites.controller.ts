import { Controller, Get, Post, Body, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebsitesService } from './websites.service';
import { Website } from './websites.schema';

@Controller('')
export class WebsitesController {
    constructor(
        private readonly websitesService: WebsitesService,
        @InjectModel(Website.name) private readonly websiteModel: Model<Website>,
    ) {}

    @Post('add')
    async addWebsite(
        @Body('url') url: string,
        @Body('interval') interval: number,
    ) {
        return this.websitesService.saveWebsite(url, interval);
    }

    @Get('list')
    async listWebsites() {
        return this.websitesService.getWebsites();
    }

    @Get('check')
    async checkWebsites() {
        await this.websitesService.checkWebsites();
        return this.websitesService.getWebsites();
    }

    @Post('check-one')
    async checkOne(@Body('url') url: string) {
        const website = await this.websitesService.checkOneWebsite(url);
        if (!website) {
            throw new NotFoundException('Website not found');
        }
        return website;
    }

    @Post('update-interval')
    async updateInterval(@Body('url') url: string, @Body('interval') interval: number) {
        const website = await this.websiteModel.findOne({ url });
        if (!website) {
            throw new NotFoundException('Website not found');
        }
        website.interval = interval;
        await website.save();
        await this.websitesService.scheduleNextCheck();
        return website;
    }

    @Post('delete')
    async deleteWebsite(@Body('url') url: string) {
        await this.websitesService.deleteWebsite(url);
        return { success: true };
    }

    @Post('set-email')
    async setEmail(@Body('email') email: string) {
        await this.websitesService.setEmailTo(email);
        return { success: true };
    }

    @Get('get-email')
    async getEmail() {
        const email = await this.websitesService.getEmailTo();
        return { email };
    }
}
