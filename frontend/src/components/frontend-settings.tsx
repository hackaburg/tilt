import * as React from "react";
import { useCallback } from "react";
import type { FrontendSettingsDTO } from "../api/types/dto";
import { useSettingsContext } from "../contexts/settings-context";
import { Col, Row } from "./grid";
import { Subheading } from "./headings";
import { Message } from "./message";
import { TextInput, TextInputType } from "./text-input";

/**
 * A component to modify the frontend/appearance settings.
 */
export const FrontendSettings = () => {
  const { settings, updateSettings, updateError } = useSettingsContext();

  const updateFrontendSettings = useCallback(
    (field: keyof FrontendSettingsDTO, value: any) => {
      updateSettings({
        ...settings,
        frontend: {
          ...settings.frontend,
          [field]: value,
        },
      });
    },
    [updateSettings, settings],
  );

  const handleColorGradientStartChange = useCallback(
    (value) => updateFrontendSettings("colorGradientStart", value),
    [updateFrontendSettings],
  );

  const handleColorGradientEndChange = useCallback(
    (value) => updateFrontendSettings("colorGradientEnd", value),
    [updateFrontendSettings],
  );

  const handleColorLinkChange = useCallback(
    (value) => updateFrontendSettings("colorLink", value),
    [updateFrontendSettings],
  );

  const handleColorLinkHoverChange = useCallback(
    (value) => updateFrontendSettings("colorLinkHover", value),
    [updateFrontendSettings],
  );

  const handleLoginSignupImageChange = useCallback(
    (value) => updateFrontendSettings("loginSignupImage", value),
    [updateFrontendSettings],
  );

  const handleSidebarImageChange = useCallback(
    (value) => updateFrontendSettings("sidebarImage", value),
    [updateFrontendSettings],
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
          <TextInput
            title="Gradient start color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            value={settings.frontend.colorGradientStart}
            onChange={handleColorGradientStartChange}
          />
        </Col>
        <Col percent={50}>
          <TextInput
            title="Gradient end color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            value={settings.frontend.colorGradientEnd}
            onChange={handleColorGradientEndChange}
          />
        </Col>
      </Row>

      <Row>
        <Col percent={50}>
          <TextInput
            title="Link color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            value={settings.frontend.colorLink}
            onChange={handleColorLinkChange}
          />
        </Col>
        <Col percent={50}>
          <TextInput
            title="Link hover color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            value={settings.frontend.colorLinkHover}
            onChange={handleColorLinkHoverChange}
          />
        </Col>
      </Row>

      <Row>
        <Col percent={50}>
          <TextInput
            title="Login and signup image url"
            placeholder="absolute image url with https"
            type={TextInputType.Text}
            value={settings.frontend.loginSignupImage}
            onChange={handleLoginSignupImageChange}
          />
        </Col>
        <Col percent={50}>
          <TextInput
            title="Sidebar image url"
            placeholder="absolute image url with https"
            type={TextInputType.Text}
            value={settings.frontend.sidebarImage}
            onChange={handleSidebarImageChange}
          />
        </Col>
      </Row>
    </>
  );
};
