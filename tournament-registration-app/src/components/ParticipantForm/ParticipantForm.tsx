import { FormEventHandler, useState } from "react";
import { useCookie } from "../../hooks";
import { HeadshotCam } from "../HeadshotCam";
import { useMutation } from "@tanstack/react-query";
import { createParticipant, updateParticipant } from "../../api";
import { Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { HeadshotType, Participant } from "../../types";

export interface Props {
  participant?: Participant | null;
}

export const ParticipantForm = ({ participant }: Props) => {
  const [headshot, setHeadshot] = useState<string | null>(
    participant?.headshotKey || null
  );
  const [headshotType, setHeadshotType] = useState<HeadshotType>(
    HeadshotType.IMAGEKEY
  );
  const [error, setError] = useState<string | null>(null);
  const { getCookie } = useCookie("token");
  const navigate = useNavigate();

  const createParticipantMutation = useMutation(
    ["createParticipant"],
    (data: FormData) => createParticipant(data, getCookie() || ""),
    {
      onSuccess: (data) => {
        if (data.error) {
          setError(data.error.message);
        } else {
          navigate("/dashboard?tab=participant");
        }
      },
    }
  );

  const updateParticipantMutation = useMutation(
    ["updateParticipant"],
    (data: FormData) =>
      updateParticipant(data, getCookie() || "", participant?.id),
    {
      onSuccess: (data) => {
        if (data.error) {
          setError(data.error.message);
        } else {
          navigate("/dashboard?tab=participant");
        }
      },
    }
  );

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = form.fullName.value;
    const dob = form.dob.value;
    const gender = form.gender.value;
    const email = form.email.value;
    const phone = form.phoneNum.value;
    const parentEmail = form.parentEmail.value;
    const headshotBlob = await fetch(headshot || "").then((r) => r.blob());
    const headshotFile = new File([headshotBlob], "headshot.png");
    const waiver = form.waiver.files?.[0];
    const photoId = form.photoId.files?.[0];

    const formData = new FormData();
    formData.append("name", name);
    formData.append("dob", dob);
    formData.append("gender", gender);
    formData.append("email", email);
    formData.append("phoneNumber", phone);
    formData.append("parentEmail", parentEmail);
    formData.append("headshot", headshotFile);
    formData.append("waiver", waiver || "");
    formData.append("photoId", photoId || "");

    console.log(formData);

    createParticipantMutation.mutate(formData);
  };

  const handleUpdate: FormEventHandler = async (e) => {
    e.preventDefault();
    let form = e.target as HTMLFormElement;
    let name = form.fullName.value;
    let dob = form.dob.value;
    let gender = form.gender.value;
    let email = form.email.value;
    let phone = form.phoneNum.value;
    let parentEmail = form.parentEmail.value;
    let headshotBlob = await fetch(headshot || "").then((r) => r.blob());
    let headshotFile = new File([headshotBlob], "headshot.png");
    let waiver = form.waiver.files?.[0];
    let photoId = form.photoId.files?.[0];

    const formData = new FormData();

    if (!name || name === "") {
      name = participant?.name;
    }

    if (!dob || dob === "") {
      dob = participant?.dob;
    }

    if (!email || email === "") {
      email = participant?.email;
    }

    if (!phone || phone === "") {
      phone = participant?.phoneNumber;
    }

    if (!parentEmail || parentEmail === "") {
      parentEmail = participant?.parentEmail;
    }

    formData.append("name", name);
    formData.append("dob", dob);
    formData.append("gender", gender);
    formData.append("email", email);
    formData.append("phoneNumber", phone);
    formData.append("parentEmail", parentEmail);

    if (headshotFile) {
      formData.append("headshot", headshotFile);
    }

    if (waiver) {
      formData.append("waiver", waiver || "");
    }

    if (photoId) {
      formData.append("photoId", photoId || "");
    }

    updateParticipantMutation.mutate(formData);
  };

  const photoCallback = () => {
    setHeadshotType(HeadshotType.HEADSHOT);
  };

  return (
    <div className="container">
      <Alert variant="danger" show={Boolean(error)}>
        {error}
      </Alert>
      <form onSubmit={participant ? handleUpdate : handleSubmit}>
        <div className="row  mb-1">
          <div className="col-md-4">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              placeholder="Full Name"
              defaultValue={participant?.name || ""}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="dob" className="form-label">
              Date of Birth
            </label>
            <input
              type="date"
              className="form-control"
              id="dob"
              placeholder="Date of Birth"
              defaultValue={participant?.dob.split("T")[0] || ""}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="gender" className="form-label">
              Gender
            </label>
            <select
              className="form-select"
              aria-label="Default select example"
              placeholder="Please Select"
              id="gender"
              defaultValue={participant?.gender || ""}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="row my-1">
          <div className="col-md-4">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Email"
              defaultValue={participant?.email || ""}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="parentEmail" className="form-label">
              Parent Email
            </label>
            <input
              type="email"
              className="form-control"
              id="parentEmail"
              placeholder="Parent Email"
              defaultValue={participant?.parentEmail || ""}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="phoneNum" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              className="form-control"
              id="phoneNum"
              placeholder="Phone Number"
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              defaultValue={participant?.phoneNumber || ""}
            />
          </div>
        </div>
        {participant && (
          <div className="row my-1">
            <h2>Replace Files</h2>
          </div>
        )}
        <div className="row my-1">
          <div className="col-md-6">
            <label htmlFor="photoId" className="form-label">
              Photo ID
            </label>
            <input
              type="file"
              className="form-control"
              id="photoId"
              placeholder="Photo ID"
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="waiver" className="form-label">
              Waiver
            </label>
            <input
              type="file"
              className="form-control"
              id="waiver"
              placeholder="Waiver"
            />
          </div>
        </div>
        <div className="row my-1">
          <h1>Headshot</h1>
        </div>
        <HeadshotCam
          setHeadshot={setHeadshot}
          headshot={headshot}
          type={headshotType}
          callback={photoCallback}
        />
        <div className="row mt-1">
          <div className="col-md-12 d-flex justify-content-center">
            <button className="btn btn-primary" type="submit">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
