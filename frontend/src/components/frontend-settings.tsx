import * as React from "react";
import { useDebouncedCallback } from "use-debounce";
import { IFrontendSettings } from "../../../types/settings";
import { debounceDuration } from "../config";
import { useSettingsContext } from "../contexts/settings-context";
import { Col, Row } from "./grid";
import { Subheading } from "./headings";
import { Message } from "./message";
import { StatefulTextInput, TextInputType } from "./text-input";

/**
 * A component to modify the frontend/appearance settings.
 */
export const FrontendSettings = () => {
  const { settings, updateSettings, updateError } = useSettingsContext();

  const [debouncedHandleSettingsChange] = useDebouncedCallback(
    (field: keyof IFrontendSettings, value: any) => {
      updateSettings({
        ...settings,
        frontend: {
          ...settings.frontend,
          [field]: value,
        },
      });
    },
    debounceDuration,
    [updateSettings, settings],
  );

  return (
    <>
      <Subheading>Appearance</Subheading>

      {updateError && <Message error>{updateError.message}</Message>}

      <p>
        Adjust these settings to modify the appearance of tilt, using hex colors
        and absolute image urls.
      </p>

      <Row>
        <Col percent={50}>
          <StatefulTextInput
            title="Gradient start color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            initialValue={settings.frontend.colorGradientStart}
            onChange={(value) =>
              debouncedHandleSettingsChange("colorGradientStart", value)
            }
          />
        </Col>
        <Col percent={50}>
          <StatefulTextInput
            title="Gradient end color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            initialValue={settings.frontend.colorGradientEnd}
            onChange={(value) =>
              debouncedHandleSettingsChange("colorGradientEnd", value)
            }
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
            onChange={(value) =>
              debouncedHandleSettingsChange("colorLink", value)
            }
          />
        </Col>
        <Col percent={50}>
          <StatefulTextInput
            title="Link hover color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            initialValue={settings.frontend.colorLinkHover}
            onChange={(value) =>
              debouncedHandleSettingsChange("colorLinkHover", value)
            }
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
            onChange={(value) =>
              debouncedHandleSettingsChange("loginSignupImage", value)
            }
          />
        </Col>
        <Col percent={50}>
          <StatefulTextInput
            title="Sidebar image url"
            placeholder="absolute image url with https"
            type={TextInputType.Text}
            initialValue={settings.frontend.sidebarImage}
            onChange={(value) =>
              debouncedHandleSettingsChange("sidebarImage", value)
            }
          />
        </Col>
      </Row>
    </>
  );
};
