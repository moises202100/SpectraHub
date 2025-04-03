import paypal from "@paypal/checkout-server-sdk";
import { NextResponse } from "next/server";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(req) {
    try {
        // Parsear el cuerpo de la solicitud
        const body = await req.json();
        const { price, item } = body;

        // Validar los datos recibidos
        if (!price || !item) {
            return NextResponse.json(
                { error: "Datos incompletos para crear la orden" },
                { status: 400 }
            );
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: price.toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: "USD",
                                value: price.toFixed(2),
                            },
                        },
                    },
                    items: [
                        {
                            name: item.description,
                            quantity: "1",
                            unit_amount: {
                                currency_code: "USD",
                                value: price.toFixed(2),
                            },
                        },
                    ],
                },
            ],
        });

        // Ejecutar la solicitud de creación de orden
        const order = await client.execute(request);
        return NextResponse.json({ id: order.result.id });
    } catch (error) {
        console.error("Error al crear la orden:", error);
        return NextResponse.json(
            { error: "No se pudo crear la orden" },
            { status: 500 }
        );
    }
}
