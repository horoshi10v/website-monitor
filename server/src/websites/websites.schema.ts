import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WebsiteDocument = HydratedDocument<Website>;

@Schema()
export class Website {
    @Prop({ required: true })
    url: string;

    @Prop({ required: true, default: 1 })
    interval: number;

    @Prop({ required: false })
    lastChecked?: Date;

    @Prop({ required: false })
    status?: string;
}

export const WebsiteSchema = SchemaFactory.createForClass(Website);
