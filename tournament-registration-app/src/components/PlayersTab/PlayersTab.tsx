import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPlayers } from "../../api";
import { useCookie } from "../../hooks";
import { Player, UserError, isUserError } from "../../types";
import { PlayerCard, PlayerCreateModal } from "..";
import { useNavigate } from "react-router-dom";
import { chunk } from "../../utilities";
import { useState } from "react";

export const PlayersTab = () => {
  const { cookie } = useCookie("token");
  const { data } = useQuery(["players", cookie], getPlayers);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const renderBody = (data?: Player[] | UserError) => {
    if (isUserError(data)) {
      return <p>{data.message}</p>;
    } else if (data && data.length > 0) {
      const playerRows = chunk(data, 3);
      const playerCards = playerRows.map((row, index) => (
        <div className="row mt-2" key={index}>
          {row.map((player: Player) => {
            const team = player.Team;
            const category = team && team.Category;
            return (
              <div className="col-md-4 mt-sm-2" key={player.id}>
                <PlayerCard player={player} />
              </div>
            );
          })}
        </div>
      ));
      return playerCards;
    } else {
      return <p>You currently have no registered Players</p>;
    }
  };

  const handleHide = () => {
    setShowModal(false);
    queryClient.invalidateQueries(["players"]);
  };

  return (
    <>
      <div className="d-flex justify-content-between mt-2">
        <h2>Players</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Player
        </button>
      </div>
      <div className="row mt-2">
        <p>
          In order to participate in tournaments, you must first create a player
          profile. This profile will allow you to join a team and compete in the
          tournament.
        </p>
      </div>
      {data && renderBody(data)}
      <PlayerCreateModal show={showModal} onHide={handleHide} />
    </>
  );
};
