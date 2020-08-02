import * as React from "react";
import { useCallback } from "react";
import type { FrontendSettingsDTO } from "../../api/types/dto";
import { useSettingsContext } from "../../contexts/settings-context";
import { Col, ColSpacer, Row } from "../base/grid";
import { Message } from "../base/message";
import { Text } from "../base/text";
import { TextInput, TextInputType } from "../base/text-input";
import { SettingsSection } from "./settings-section";

/**
 * A component to modify the frontend/appearance settings.
 */
export const FrontendSettings = () => {
  const { settings, updateSettings, updateError } = useSettingsContext();

  const updateFrontendSettings = useCallback(
    (changes: Partial<FrontendSettingsDTO>) => {
      updateSettings({
        ...settings,
        frontend: {
          ...settings.frontend,
          ...changes,
        },
      });
    },
    [updateSettings, settings],
  );

  const handleColorGradientStartChange = useCallback(
    (colorGradientStart) => updateFrontendSettings({ colorGradientStart }),
    [updateFrontendSettings],
  );

  const handleColorGradientEndChange = useCallback(
    (colorGradientEnd) => updateFrontendSettings({ colorGradientEnd }),
    [updateFrontendSettings],
  );

  const handleColorLinkChange = useCallback(
    (colorLink) => updateFrontendSettings({ colorLink }),
    [updateFrontendSettings],
  );

  const handleColorLinkHoverChange = useCallback(
    (colorLinkHover) => updateFrontendSettings({ colorLinkHover }),
    [updateFrontendSettings],
  );

  const handleLoginSignupImageChange = useCallback(
    (loginSignupImage) => updateFrontendSettings({ loginSignupImage }),
    [updateFrontendSettings],
  );

  const handleSidebarImageChange = useCallback(
    (sidebarImage) => updateFrontendSettings({ sidebarImage }),
    [updateFrontendSettings],
  );

  return (
    <SettingsSection title="Appearance">
      {updateError && <Message error>{updateError.message}</Message>}

      <Text>
        Adjust these settings to modify the appearance of tilt, using hex colors
        and absolute image urls.
      </Text>

      <Row>
        <Col>
          <TextInput
            title="Gradient start color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            value={settings.frontend.colorGradientStart}
            onChange={handleColorGradientStartChange}
          />
        </Col>
        <ColSpacer />
        <Col>
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
        <Col>
          <TextInput
            title="Link color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            value={settings.frontend.colorLink}
            onChange={handleColorLinkChange}
          />
        </Col>
        <ColSpacer />
        <Col>
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
        <Col>
          <TextInput
            title="Login and signup image url"
            placeholder="absolute image url with https"
            type={TextInputType.Text}
            value={settings.frontend.loginSignupImage}
            onChange={handleLoginSignupImageChange}
          />
        </Col>
        <ColSpacer />
        <Col>
          <TextInput
            title="Sidebar image url"
            placeholder="absolute image url with https"
            type={TextInputType.Text}
            value={settings.frontend.sidebarImage}
            onChange={handleSidebarImageChange}
          />
        </Col>
      </Row>
    </SettingsSection>
  );
};
