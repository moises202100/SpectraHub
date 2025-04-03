"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import useTokenStore from "@/store/tokenStore"; // Importa el store de Zustand

function HomePage() {
    const { user } = useUser();
    const [items] = useState([
        { id: 1, quantity: 1000, price: 112.99, fee: 4.0, perToken: "8¢" },
        { id: 2, quantity: 750, price: 84.99, fee: 4.0, perToken: "8¢" },
        { id: 3, quantity: 500, price: 56.99, fee: 3.0, perToken: "9¢" },
        { id: 4, quantity: 200, price: 22.99, fee: 2.0, perToken: "10¢" },
        { id: 5, quantity: 100, price: 11.99, fee: 1.0, perToken: "11¢" },
    ]);
    const [selectedItem, setSelectedItem] = useState(null);
    const selectedItemRef = useRef(null);
    const { incrementTokens } = useTokenStore(); // Acceder al estado global para actualizar tokens

    const handleItemSelect = (item) => {
        setSelectedItem(item);
        selectedItemRef.current = item;
    };

    return (
        <div className="h-screen bg-slate-950 flex flex-col justify-center items-center">
            <div className="mb-4 text-white w-full max-w-md">
                <h2 className="text-xl font-bold text-center mb-4">Seleccione un paquete</h2>
                <ul className="space-y-4">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className={`p-4 rounded-lg border-2 ${
                                selectedItem?.id === item.id
                                    ? "border-blue-500 bg-blue-100 text-blue-900"
                                    : "border-gray-500 bg-gray-100 text-gray-900"
                            } cursor-pointer`}
                            onClick={() => handleItemSelect(item)}
                        >
                            <div className="flex justify-between items-center">
                                <div className="text-2xl font-bold">{item.quantity}</div>
                                <div className="text-xl font-bold">${item.price.toFixed(2)}</div>
                            </div>
                            <div className="text-sm mt-2">
                                <span>{item.perToken} por token</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {selectedItem && (
                <div className="text-white mb-4 text-center">
                    <p>
                        <strong>Paquete seleccionado:</strong> {selectedItem.quantity} tokens - ${selectedItem.price.toFixed(2)}
                    </p>
                </div>
            )}

            <PayPalScriptProvider
                options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                }}
            >
                <PayPalButtons
                    style={{
                        color: "blue",
                        layout: "horizontal",
                    }}
                    createOrder={async () => {
                        const currentItem = selectedItemRef.current;
                        if (!currentItem) {
                            alert("Por favor seleccione un paquete primero.");
                            throw new Error("No item selected");
                        }

                        try {
                            const res = await fetch("/api/checkout", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    price: currentItem.price,
                                    item: {
                                        quantity: currentItem.quantity,
                                        description: `${currentItem.quantity} tokens`,
                                    },
                                }),
                            });

                            if (!res.ok) {
                                throw new Error("Error al crear la orden en el servidor.");
                            }

                            const order = await res.json();
                            console.log("Orden creada:", order);
                            return order.id;
                        } catch (error) {
                            console.error("Error en createOrder:", error);
                            throw new Error("No se pudo crear la orden.");
                        }
                    }}
                    onApprove={async (data, actions) => {
                        try {
                            const details = await actions.order.capture();
                            
                            if (!user?.id) {
                                throw new Error("Usuario no autenticado");
                            }
                    
                            const res = await fetch("/api/update-tokens", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ 
                                    userId: user.id,
                                    tokens: selectedItemRef.current.quantity 
                                }),
                            });
                    
                            if (!res.ok) {
                                throw new Error("Error al actualizar tokens");
                            }
                    
                            const data = await res.json();
                            
                            if (data.success) {
                                incrementTokens(selectedItemRef.current.quantity);
                                alert("¡Compra exitosa! Tokens actualizados.");
                            }
                        } catch (error) {
                            console.error("Error:", error);
                            alert("Error al procesar la compra");
                        }
                    }}
                    onCancel={(data) => {
                        console.log("Cancelado:", data);
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
}

export default HomePage;
