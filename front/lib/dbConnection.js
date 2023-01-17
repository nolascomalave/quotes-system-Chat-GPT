import { connect, connection } from "mongoose";
import createRoles from './createRoles';

const conn = {
  isConnected: false,
};

export async function dbConnect() {
  createRoles.start();
  if (conn.isConected) return;

  const db = await connect(process.env.MONGODB_URI);

  conn.isConnected = db.connections[0].readyState;
}

connection.on("connected", () => {
  console.log("Mongodb connected to db");
});

connection.on("error", (err) => {
  console.error("Mongodb is not connected by:", err.message);
});