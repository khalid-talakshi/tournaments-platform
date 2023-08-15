import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Player } from "../../types";
import { deletePlayer, updatePlayer } from "../../api";
import { useCookie } from "../../hooks";
import { useState } from "react";
import { PlayerDeleteModal, PlayerEditModal } from "..";

export interface Props {
  player: Player;
}

export const PlayerCard = ({ player }: Props) => {
  const { getCookie } = useCookie("token");
  const queryClient = useQueryClient();
  const deletePlayerMutation = useMutation(
    ["deletePlayer"],
    () => deletePlayer(getCookie() || "", player.id),
    {
      onSuccess: () => {
        setShowModal(false);
        queryClient.invalidateQueries(["players"]);
      },
    }
  );

  const updatePlayerMutation = useMutation(
    ["updatePlayer"],
    (data: { jerseyNumber: number; teamId: number }) =>
      updatePlayer(getCookie() || "", player.id, {
        teamId: data.teamId,
        jerseyNumber: data.jerseyNumber,
      }),
    {
      onSuccess: () => {
        setShowEditModal(false);
        queryClient.invalidateQueries(["players"]);
      },
    }
  );

  const handleDelete = () => {
    deletePlayerMutation.mutate();
  };

  const handleEdit = (jerseyNumber: number, teamId: number) => {
    updatePlayerMutation.mutate({ teamId, jerseyNumber });
  };

  const category = player.Team?.Category;
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  return (
    <>
      <div className="card">
        <h5 className="card-header">{player.Participant?.name}</h5>
        <div className="card-body">
          <p className="card-text my-0">Team: {player.Team?.teamName}</p>
          {category && (
            <p className="card-text my-0">Division: {category.code}</p>
          )}
          <p className="card-text my-0">Jersey: {player.jerseyNumber}</p>
        </div>
        <div className="card-footer">
          <div className="d-flex flex-row">
            <button
              className="btn btn-primary me-1"
              onClick={() => setShowEditModal(true)}
            >
              Edit Jersey Number
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setShowModal(true)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <PlayerDeleteModal
        showModal={showModal}
        setShowModal={setShowModal}
        handleDelete={handleDelete}
        player={player}
      />
      <PlayerEditModal
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        player={player}
        handleEdit={handleEdit}
      />
    </>
  );
};
