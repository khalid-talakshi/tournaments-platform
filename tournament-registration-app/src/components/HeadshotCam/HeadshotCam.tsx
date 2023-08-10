import Webcam from "react-webcam";
import { S3Image } from "../S3Image";
import { useCallback, useRef } from "react";
import { useCookie } from "../../hooks";

interface Props {
  setHeadshot: (headshot: string | null) => void;
  headshot: string | null;
}

export const HeadshotCam = ({ setHeadshot, headshot }: Props) => {
  const webcamRef = useRef<Webcam | null>(null);

  const capture = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      const imageSrc = webcamRef.current?.getScreenshot();
      setHeadshot(imageSrc || null);
    },
    [webcamRef]
  );

  const { getCookie } = useCookie("token");

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
        {headshot ? (
          <S3Image headshot={headshot} token={getCookie() || ""} />
        ) : (
          <p>No headshot yet</p>
        )}
      </div>
    </div>
  );
};
