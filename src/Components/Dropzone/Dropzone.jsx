import React, { useEffect } from "react";
import "./styles.css";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUpload, faImage, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import cogoToast from "cogo-toast";

function Dropzone({ getData = () => {}, multiple }) {
    const { acceptedFiles, getRootProps, getInputProps, fileRejections } = useDropzone({
        noDragEventsBubbling: true,
        accept: ["image/png", "image/jpeg", "application/pdf"],
        // accept: { "application/pdf": []},
        validator: sizeValidator,
        multiple: multiple,
    });

    function sizeValidator(file) {
        if (file.size > 2000000) {
            cogoToast.error("File size cannot be more than 2MB");
            return {
                code: "Size Limit exceeded",
                message: `File Size is larger than ${2} MB`,
            };
        }

        if (file.size === 0) {
            cogoToast.error("File size cannot be 0,please consider reuploading");
            return {
                code: "File size in 0",
                message: `File Size is 0`,
            };
        }

        return null;
    }

    const files = acceptedFiles.map((file) => {
        return (
            <li key={file.path}>
                {file.type === "image/png" ? <FontAwesomeIcon icon={faImage} /> : <FontAwesomeIcon icon={faFilePdf} />} {file.path}{" "}
            </li>
        );
    });

    useEffect(() => {
        if (acceptedFiles.length > 0) {
            getData(acceptedFiles);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [acceptedFiles]);

    useEffect(() => {
        if (fileRejections.length > 0) {
            cogoToast.error("File type not allowed");
        }
    }, [fileRejections]);

    return (
        <section className="dropzone__container">
            <div
                {...getRootProps()}
                style={{ textAlign: "center" }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <input {...getInputProps()} />
                <svg className="upload__icon">
                    <FontAwesomeIcon icon={faCloudUpload} />
                </svg>
                <p>Drag and drop some files here, or click to select files</p>
            </div>

            <div>
                <ul className="display__files">{files}</ul>
            </div>

            {/* <aside>
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside> */}
        </section>
    );
}

export default Dropzone;
