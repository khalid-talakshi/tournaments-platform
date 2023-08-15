import Webcam from "react-webcam";
import { S3Image } from "../S3Image";
import { useCallback, useRef } from "react";
import { useCookie } from "../../hooks";
import { HeadshotType } from "../../types";

interface Props {
  setHeadshot: (headshot: string | null) => void;
  headshot: string | null;
  type?: HeadshotType;
  callback?: () => void;
}

export const HeadshotCam = ({
  setHeadshot,
  headshot,
  type,
  callback,
}: Props) => {
  const webcamRef = useRef<Webcam | null>(null);

  const capture = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      const imageSrc = webcamRef.current?.getScreenshot();
      setHeadshot(imageSrc || null);
      callback && callback();
    },
    [webcamRef]
  );

  const { getCookie } = useCookie("token");

  const handlePhoto = () => {
    if (type == HeadshotType.IMAGEKEY) {
      console.log("here");
      return (
        <S3Image imageKey={headshot || undefined} token={getCookie() || ""} />
      );
    } else if (headshot) {
      return <S3Image headshot={headshot} token={getCookie() || ""} />;
    } else {
      return <p>No Headshot Yet</p>;
    }
  };

  return (
    <div className="row my-3">
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
        {handlePhoto()}
      </div>
    </div>
  );
};
