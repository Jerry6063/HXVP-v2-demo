/** Thin route wrapper — Crew Messages inbox. */
import MessagesV2 from "./MessagesV2";
import { CREW_MESSAGES } from "./mockData";

export default function CrewMessagesV2() {
  return <MessagesV2 title="Crew Messages" messages={CREW_MESSAGES} />;
}
