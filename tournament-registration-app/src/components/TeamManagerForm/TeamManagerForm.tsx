import { FormEventHandler, useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useMutation } from "@tanstack/react-query";
import { createTeamManager, updateTeamManager } from "../../api";
import { useCookie } from "../../hooks";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { TeamManager } from "../../types";
import { S3Image } from "../S3Image";

export interface Props {
  teamManager?: TeamManager;
}

export const TeamManagerForm = ({ teamManager }: Props) => {
  const [headshot, setHeadshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getCookie } = useCookie("token");
  const navigate = useNavigate();

  const handlePhoto = () => {
    if (teamManager?.headshot && !headshot) {
      return (
        <S3Image imageKey={teamManager.headshot} token={getCookie() || ""} />
      );
    } else if (headshot) {
      return <S3Image headshot={headshot} token={getCookie() || ""} />;
    } else {
      return "";
    }
  };

  const currentDate = new Date(Date.now());
  const maxYear = currentDate.getFullYear() - 18;
  const maxDateString = `${maxYear}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}`;

  const webcamRef = useRef<Webcam | null>(null);
  const capture = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      const imageSrc = webcamRef.current?.getScreenshot();
      setHeadshot(imageSrc || null);
    },
    [webcamRef]
  );

  const createTeamManagerMutation = useMutation(
    ["createTeamManager"],
    (data: FormData) => createTeamManager(data, getCookie() || ""),
    {
      onSuccess: (data) => {
        if (data.error) {
          setError(data.error.message);
        } else {
          navigate("/dashboard");
        }
      },
    }
  );

  const updateTeamManagerMutation = useMutation(
    ["updateTeamManager"],
    (data: FormData) => updateTeamManager(data, getCookie() || ""),
    {
      onSuccess: (data) => {
        if (data.error) {
          setError(data.error.message);
        } else {
          navigate("/dashboard");
        }
      },
    }
  );

  const handleUpdate: FormEventHandler = async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    let firstName = form.firstName.value;
    let lastName = form.lastName.value;
    let dob = form.dob.value;
    const headshotBlob = await fetch(headshot || "").then((r) => r.blob());
    const headshotFile = new File([headshotBlob], "headshot.png");
    if (!firstName || firstName === "") {
      firstName = teamManager?.firstName;
    }
    if (!lastName || lastName === "") {
      lastName = teamManager?.lastName;
    }
    if (!dob || dob === "") {
      dob = teamManager?.dob;
    }
    const formData = new FormData();
    formData.append("firstName", firstName || "");
    formData.append("lastName", lastName || "");
    formData.append("dob", dob || "");
    if (headshot) {
      formData.append("headshot", headshotFile);
    }
    updateTeamManagerMutation.mutate(formData);
  };

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const firstName = form.firstName.value;
    const lastName = form.lastName.value;
    const dob = form.dob.value;
    console.log(dob);
    const headshotBlob = await fetch(headshot || "").then((r) => r.blob());
    const headshotFile = new File([headshotBlob], "headshot.png");
    if (!firstName || firstName === "") {
      setError("First name is required");
      return;
    }
    if (!lastName || lastName === "") {
      setError("Last name is required");
      return;
    }
    if (!dob || dob === "") {
      setError("Date of Birth is required");
      return;
    }
    if (!headshot || headshot === "") {
      setError("Headshot is required");
      return;
    }
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("dob", dob);
    formData.append("headshot", headshotFile);
    createTeamManagerMutation.mutate(formData);
  };

  return (
    <div className="container">
      <Alert variant="danger" show={Boolean(error)}>
        {error}
      </Alert>
      <form onSubmit={teamManager ? handleUpdate : handleSubmit}>
        <div className="row">
          <h2>Information</h2>
        </div>
        <div className="row">
          <div className="col-md-4">
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              placeholder="First Name"
              defaultValue={teamManager?.firstName || ""}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              placeholder="Last Name"
              defaultValue={teamManager?.lastName || ""}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="dob">Date of Birth</label>
            <input
              id="dob"
              className="form-control"
              type="date"
              max={maxDateString}
              defaultValue={teamManager?.dob.split("T")[0] || ""}
            />
          </div>
        </div>
        <div className="row mt-1">
          <h2>Headshot</h2>
        </div>
        <div className="row mt-1">
          <div className="col-md-5 d-flex justify-content-center">
            <Webcam
              width={400}
              height="auto"
              style={{ margin: 0 }}
              id="headshot"
              mirrored
              screenshotFormat="image/png"
              ref={webcamRef}
            />
          </div>
          <div className="col-md-2 d-flex align-items-center justify-content-center">
            <button className="btn btn-primary" onClick={capture}>
              Take Picture
            </button>
          </div>
          <div className="col-md-5 d-flex justify-content-center">
            {teamManager?.headshot || headshot ? (
              handlePhoto()
            ) : (
              <p>No headshot yet</p>
            )}
          </div>
        </div>
        <button className="btn btn-primary mt-2">
          {createTeamManagerMutation.isLoading && (
            <span
              className="spinner-grow spinner-grow-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
          {teamManager ? "Update" : "Submit"}
        </button>
      </form>
    </div>
  );
};
