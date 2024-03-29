import { Tab, Tabs } from "react-bootstrap";
import {
  CoachesTab,
  ParticipantTab,
  PlayersTab,
  TeamManagerTab,
  Teams,
} from "../../components";
import { useSearchParams } from "react-router-dom";

export const Dashboard = () => {
  const [params, setSearchParams] = useSearchParams();

  console.log(params.get("tab"));

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <Tabs
        activeKey={params.get("tab") || "team-manager"}
        onSelect={(k) => setSearchParams(`tab=${k || "team-manager"}`)}
      >
        <Tab eventKey="team-manager" title="Team Manager Profile">
          <TeamManagerTab />
        </Tab>
        <Tab eventKey="participant" title="Participants">
          <ParticipantTab />
        </Tab>
        <Tab eventKey="player" title="Players">
          <PlayersTab />
        </Tab>
        <Tab eventKey="coach" title="Coaches">
          <CoachesTab />
        </Tab>
        <Tab eventKey="teams" title="Teams">
          <Teams />
        </Tab>
      </Tabs>
    </div>
  );
};
