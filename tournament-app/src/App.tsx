/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SingleEliminationBracket,
  Match,
  SVGViewer,
  createTheme,
} from "@g-loot/react-tournament-brackets";
import { useWindowSize } from "./hooks";
import {
  createParticipants,
  createPlayInGames,
  createRoundOne,
  createBracketDS2,
} from "./util";

export default function App() {
  const teams = Array.from({ length: 5 }, (_, i) => i + 1);
  const participants = createParticipants(teams);
  const bracket = createPlayInGames(participants);
  const roundOne = createRoundOne(bracket);
  const matches = createBracketDS2(roundOne);

  console.log("bracket", matches);

  return <SingleElimination bracket={matches || []} />;
}

export interface SingleEliminationProps {
  bracket: any[];
}

export const SingleElimination = ({ bracket }: SingleEliminationProps) => {
  const windowSize = useWindowSize();
  return (
    <SingleEliminationBracket
      theme={GlootTheme}
      matches={bracket}
      matchComponent={Match}
      svgWrapper={({ children, ...props }) => (
        <SVGViewer
          width={windowSize.width}
          height={windowSize.height}
          background="rgb(11, 13, 19)"
          SVGBackground="rgb(11, 13, 19)"
          {...props}
        >
          {children}
        </SVGViewer>
      )}
      onMatchClick={(match) => console.log(match)}
      onPartyClick={(match) => console.log(match)}
    />
  );
};

const GlootTheme = createTheme({
  textColor: { main: "#000000", highlighted: "#F4F2FE", dark: "#707582" },
  matchBackground: { wonColor: "#2D2D59", lostColor: "#1B1D2D" },
  score: {
    background: {
      wonColor: `#10131C`,
      lostColor: "#10131C",
    },
    text: { highlightedWonColor: "#7BF59D", highlightedLostColor: "#FB7E94" },
  },
  border: {
    color: "#292B43",
    highlightedColor: "RGBA(152,82,242,0.4)",
  },
  roundHeader: { backgroundColor: "#3B3F73", fontColor: "#F4F2FE" },
  connectorColor: "#3B3F73",
  connectorColorHighlight: "RGBA(152,82,242,0.4)",
  svgBackground: "#0F121C",
});
