const axios = require('axios');

/**
 * WhatsApp Service for Nutri Kitchen
 * Note: This requires a WhatsApp Business API provider like Interakt, AISensy, or Twilio.
 */
class WhatsAppService {
    constructor() {
        this.apiKey = process.env.WHATSAPP_API_KEY;
        this.provider = process.env.WHATSAPP_PROVIDER || 'interakt'; // Default to Interakt structure
    }

    async sendMessage(phone, order) {
        if (!this.apiKey) {
            console.log(`[WhatsApp] Skipping message to ${phone}: WHATSAPP_API_KEY not configured in .env`);
            return;
        }

        // Standardize phone number for India
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const productNames = order.orderItems.map(i => i.productName).join(', ');
        
        console.log(`[WhatsApp] Preparing message for ${cleanPhone}...`);

        try {
            if (this.provider === 'interakt') {
                return await this.sendInterakt(cleanPhone, order, productNames);
            }
            // Add other providers here (Twilio, etc.)
        } catch (error) {
            console.error('[WhatsApp] Error sending message:', error.response?.data || error.message);
        }
    }

    async sendInterakt(phone, order, productNames) {
        const payload = {
            full_phone_number: phone,
            type: "Template",
            template: {
                name: "order_confirmation_invoice", // You must create this template in Interakt dashboard
                languageCode: "en",
                bodyValues: [
                    order.customerName || "Customer",
                    order.razorpayOrderId,
                    productNames,
                    `₹${order.totalAmount.toFixed(2)}`
                ]
            }
        };

        const response = await axios.post('https://api.interakt.ai/v1/public/message/', payload, {
            headers: {
                'Authorization': `Basic ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ [WhatsApp] Message queued via Interakt for ${phone}`);
        return response.data;
    }
}

module.exports = new WhatsAppService();
