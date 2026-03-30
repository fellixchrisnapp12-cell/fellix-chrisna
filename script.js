// Konfigurasi Broker Publik
const broker = "broker.hivemq.com";
const port = 8000; 
const clientID = "web_client_" + Math.floor(Math.random() * 1000);

const client = new Paho.MQTT.Client(broker, port, clientID);

client.onMessageArrived = (message) => {
    if (message.destinationName === "latihan_esp32_ldr_99/ldr") {
        document.getElementById('ldr-value').innerText = message.payloadString;
    }
};

client.connect({
    onSuccess: () => {
        console.log("Connected to Public HiveMQ!");
        client.subscribe("latihan_esp32_ldr_99/ldr");
    },
    onFailure: (err) => console.log("Failed:", err)
});

function sendControl(state) {
    const message = new Paho.MQTT.Message(state.toUpperCase());
    message.destinationName = "latihan_esp32_ldr_99/lampu";
    client.send(message);
}