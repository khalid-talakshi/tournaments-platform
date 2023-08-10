import { FormEventHandler, useCallback, useRef, useState } from "react";
import { useCookie } from "../../hooks";
import { HeadshotCam } from "../HeadshotCam";
import { useMutation } from "@tanstack/react-query";
import { createParticipant } from "../../api";
import { Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export const ParticipantForm = () => {
  const [headshot, setHeadshot] = useState<string | null>(null);
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

  return (
    <div className="container">
      <Alert variant="danger" show={Boolean(error)}>
        {error}
      </Alert>
      <form onSubmit={handleSubmit}>
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
            />
          </div>
        </div>
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
        <HeadshotCam setHeadshot={setHeadshot} headshot={headshot} />
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
