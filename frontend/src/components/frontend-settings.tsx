import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { useDebouncedCallback } from "use-debounce";
import { IFrontendSettings, ISettings } from "../../../types/settings";
import { updateSettings } from "../actions/settings";
import { debounceDuration } from "../config";
import { IState, Nullable, RequestTarget } from "../state";
import { Col, Row } from "./grid";
import { Subheading } from "./headings";
import { Message } from "./message";
import { Placeholder } from "./placeholder";
import { StatefulTextInput, TextInputType } from "./text-input";

interface IFrontendSettingsProps {
  error?: string | false;
  settings: Nullable<ISettings>;
  dispatchUpdateSettings: typeof updateSettings;
}

/**
 * A component to modify the frontend/appearance settings.
 */
export const FrontendSettings = ({ settings, error, dispatchUpdateSettings }: IFrontendSettingsProps) => {
  const handleSettingsChange = (field: keyof IFrontendSettings, value: any) => {
    dispatchUpdateSettings(RequestTarget.FrontendSettings, {
      frontend: {
        [field]: value,
      },
    });
  };

  const [debouncedHandleSettingsChange] = useDebouncedCallback(handleSettingsChange, debounceDuration, []);

  return (
    <>
      <Subheading>Appearance</Subheading>

      {error && (
        <Message error>{error}</Message>
      )}

      <p>Adjust these settings to modify the appearance of tilt, using hex colors and absolute image urls.</p>

      {!settings && (
        <Placeholder width="100%" height="2rem" />
      )}

      {settings && (
        <>
          <Row>
            <Col percent={50}>
              <StatefulTextInput
                title="Gradient start color"
                placeholder="#abcdef"
                type={TextInputType.Text}
                initialValue={settings.frontend.colorGradientStart}
                onChange={(value) => debouncedHandleSettingsChange("colorGradientStart", value)}
              />
            </Col>
            <Col percent={50}>
              <StatefulTextInput
                title="Gradient end color"
                placeholder="#abcdef"
                type={TextInputType.Text}
                initialValue={settings.frontend.colorGradientEnd}
                onChange={(value) => debouncedHandleSettingsChange("colorGradientEnd", value)}
              />
            </Col>
          </Row>

          <Row>
            <Col percent={50}>
              <StatefulTextInput
                title="Link color"
                placeholder="#abcdef"
                type={TextInputType.Text}
                initialValue={settings.frontend.colorLink}
                onChange={(value) => debouncedHandleSettingsChange("colorLink", value)}
              />
            </Col>
            <Col percent={50}>
              <StatefulTextInput
                title="Link hover color"
                placeholder="#abcdef"
                type={TextInputType.Text}
                initialValue={settings.frontend.colorLinkHover}
                onChange={(value) => debouncedHandleSettingsChange("colorLinkHover", value)}
              />
            </Col>
          </Row>

          <Row>
            <Col percent={50}>
              <StatefulTextInput
                title="Login and signup image url"
                placeholder="absolute image url with https"
                type={TextInputType.Text}
                initialValue={settings.frontend.loginSignupImage}
                onChange={(value) => debouncedHandleSettingsChange("loginSignupImage", value)}
              />
            </Col>
            <Col percent={50}>
              <StatefulTextInput
                title="Sidebar image url"
                placeholder="absolute image url with https"
                type={TextInputType.Text}
                initialValue={settings.frontend.sidebarImage}
                onChange={(value) => debouncedHandleSettingsChange("sidebarImage", value)}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

const mapStateToProps = (state: IState) => ({
  error: state.request[RequestTarget.FrontendSettings].error,
  settings: state.settings,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    dispatchUpdateSettings: updateSettings,
  }, dispatch);
};

/**
 * The frontend settings connected to the redux store.
 */
export const ConnectedFrontendSettings = connect(mapStateToProps, mapDispatchToProps)(FrontendSettings);
