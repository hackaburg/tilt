import * as React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { DialogContent, DialogContentText, TextField } from "@mui/material";
import { Button } from "./button";

import MuiButton from "@mui/material/Button";
import { FaWhatsapp } from "react-icons/fa6";
import { MdOutlineMail } from "react-icons/md";
import { FaLinkedin } from "react-icons/fa";

/**
 * The props for the simple dialog
 * @param open - whether the dialog is open
 * @param onClose - the function to call when the dialog is closed
 * @returns the dialog
 */
export interface SimpleDialogProps {
  open: boolean;
  onClose: (value: string) => void;
}

/**
 * The simple dialog
 * @param props - the props
 * @returns the dialog
 */
export const SimpleDialog = (props: SimpleDialogProps) => {
  const { open } = props;

  const handleClick = () => {
    navigator.clipboard.writeText("https://hackaburg.de");
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Invite a friend to join</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.
          <div>
            <TextField
              id="outlined-basic"
              variant="outlined"
              value="https://hackaburg.de"
              style={{ width: "100%", marginTop: "1rem" }}
              InputProps={{
                endAdornment: (
                  <div style={{ width: "6rem" }}>
                    <Button onClick={handleClick}>Copy</Button>
                  </div>
                ),
              }}
            />
            <div style={{ marginTop: "1rem" }}>
              <MuiButton
                href="whatsapp://send?text=I am visiting Hackaburg this year! Join me at https://hackaburg.de"
                variant="outlined"
                startIcon={<FaWhatsapp />}
                style={{
                  color: "black",
                  borderColor: "black",
                  marginRight: "0.5rem",
                }}
              >
                WhatsApp
              </MuiButton>
              <MuiButton
                href="mailto:?subject=Hackaburg 2024&body=I am visiting Hackaburg this year! Join me at https://hackaburg.de"
                variant="outlined"
                startIcon={<MdOutlineMail />}
                style={{
                  color: "black",
                  borderColor: "black",
                  marginRight: "0.5rem",
                }}
              >
                Mail
              </MuiButton>

              <MuiButton
                href="http://www.linkedin.com/shareArticle?mini=true&url=hackaburg.de&title=Hackaburg 2024&summary=I am visiting Hackaburg this year! Join me at https://hackaburg.de&source=Hackaburg"
                variant="outlined"
                startIcon={<FaLinkedin />}
                style={{ color: "black", borderColor: "black" }}
              >
                LinkedIn
              </MuiButton>
            </div>{" "}
          </div>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};
