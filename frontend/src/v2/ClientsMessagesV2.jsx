/** Thin route wrapper — Clients Messages inbox. */
import MessagesV2 from "./MessagesV2";
import { CLIENT_MESSAGES } from "./mockData";

export default function ClientsMessagesV2() {
  return <MessagesV2 title="Clients Messages" messages={CLIENT_MESSAGES} />;
}
