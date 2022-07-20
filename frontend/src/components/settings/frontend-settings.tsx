import * as React from "react";
import { useCallback } from "react";
import type { FrontendSettingsDTO } from "../../api/types/dto";
import { useSettingsContext } from "../../contexts/settings-context";
import { Spacer } from "../base/flex";
import { FlexRowColumnContainer, FlexRowContainer } from "../base/flex";
import { Text } from "../base/text";
import { TextInput, TextInputType } from "../base/text-input";
import { SettingsSection } from "./settings-section";

/**
 * A component to modify the frontend/appearance settings.
 */
export const FrontendSettings = () => {
  const { settings, updateSettings } = useSettingsContext();

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
    (colorGradientStart: string) =>
      updateFrontendSettings({ colorGradientStart }),
    [updateFrontendSettings],
  );

  const handleColorGradientEndChange = useCallback(
    (colorGradientEnd: string) => updateFrontendSettings({ colorGradientEnd }),
    [updateFrontendSettings],
  );

  const handleColorLinkChange = useCallback(
    (colorLink: string) => updateFrontendSettings({ colorLink }),
    [updateFrontendSettings],
  );

  const handleColorLinkHoverChange = useCallback(
    (colorLinkHover: string) => updateFrontendSettings({ colorLinkHover }),
    [updateFrontendSettings],
  );

  const handleLoginSignupImageChange = useCallback(
    (loginSignupImage: string) => updateFrontendSettings({ loginSignupImage }),
    [updateFrontendSettings],
  );

  const handleSidebarImageChange = useCallback(
    (sidebarImage: string) => updateFrontendSettings({ sidebarImage }),
    [updateFrontendSettings],
  );

  return (
    <SettingsSection title="Appearance">
      <Text>
        Adjust these settings to modify the appearance of tilt, using hex colors
        and absolute image urls.
      </Text>

      <FlexRowContainer>
        <FlexRowColumnContainer>
          <TextInput
            title="Gradient start color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            value={settings.frontend.colorGradientStart}
            onChange={handleColorGradientStartChange}
          />
        </FlexRowColumnContainer>
        <Spacer />
        <FlexRowColumnContainer>
          <TextInput
            title="Gradient end color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            value={settings.frontend.colorGradientEnd}
            onChange={handleColorGradientEndChange}
          />
        </FlexRowColumnContainer>
      </FlexRowContainer>

      <FlexRowContainer>
        <FlexRowColumnContainer>
          <TextInput
            title="Link color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            value={settings.frontend.colorLink}
            onChange={handleColorLinkChange}
          />
        </FlexRowColumnContainer>
        <Spacer />
        <FlexRowColumnContainer>
          <TextInput
            title="Link hover color"
            placeholder="#abcdef"
            type={TextInputType.Text}
            value={settings.frontend.colorLinkHover}
            onChange={handleColorLinkHoverChange}
          />
        </FlexRowColumnContainer>
      </FlexRowContainer>

      <FlexRowContainer>
        <FlexRowColumnContainer>
          <TextInput
            title="Login and signup image url"
            placeholder="absolute image url with https"
            type={TextInputType.Text}
            value={settings.frontend.loginSignupImage}
            onChange={handleLoginSignupImageChange}
          />
        </FlexRowColumnContainer>
        <Spacer />
        <FlexRowColumnContainer>
          <TextInput
            title="Sidebar image url"
            placeholder="absolute image url with https"
            type={TextInputType.Text}
            value={settings.frontend.sidebarImage}
            onChange={handleSidebarImageChange}
          />
        </FlexRowColumnContainer>
      </FlexRowContainer>
    </SettingsSection>
  );
};
