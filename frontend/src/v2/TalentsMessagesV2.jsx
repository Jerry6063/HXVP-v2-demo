/** Thin route wrapper — Talents Messages inbox. */
import MessagesV2 from "./MessagesV2";
import { TALENT_MESSAGES } from "./mockData";

export default function TalentsMessagesV2() {
  return <MessagesV2 title="Talents Messages" messages={TALENT_MESSAGES} />;
}
