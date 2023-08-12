import { Player } from "../../types";

export interface Props {
  player: Player;
}

export const PlayerCard = ({ player }: Props) => {
  const category = player.Team?.Category;
  return (
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
          <button className="btn btn-primary me-1">Edit</button>
          <button className="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  );
};
