import * as React from "react";
import { useCallback } from "react";
import type { CriteriaSettingsDTO } from "../../api/types/dto";
import { useSettingsContext } from "../../contexts/settings-context";
import { Spacer } from "../base/flex";
import { FlexRowColumnContainer, FlexRowContainer } from "../base/flex";
import { Text } from "../base/text";
import { TextInput, TextInputType } from "../base/text-input";
import { SettingsSection } from "./settings-section";

/**
 * A component to edit criteria for rating projects.
 */
export const CriteriaSettings = () => {
  const { settings, updateSettings } = useSettingsContext();

  const updateCriteriaSettings = useCallback(
    (changes: Partial<CriteriaSettingsDTO>) => {
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
      updateCriteriaSettings({ colorGradientStart }),
    [updateCriteriaSettings],
  );

  const handleColorGradientEndChange = useCallback(
    (colorGradientEnd: string) => updateCriteriaSettings({ colorGradientEnd }),
    [updateCriteriaSettings],
  );

  const handleColorLinkChange = useCallback(
    (colorLink: string) => updateCriteriaSettings({ colorLink }),
    [updateCriteriaSettings],
  );

  const handleColorLinkHoverChange = useCallback(
    (colorLinkHover: string) => updateCriteriaSettings({ colorLinkHover }),
    [updateCriteriaSettings],
  );

  const handleLoginSignupImageChange = useCallback(
    (loginSignupImage: string) => updateCriteriaSettings({ loginSignupImage }),
    [updateCriteriaSettings],
  );

  const handleSidebarImageChange = useCallback(
    (sidebarImage: string) => updateCriteriaSettings({ sidebarImage }),
    [updateCriteriaSettings],
  );

  return (
    <SettingsSection title="Appearance">
      <Text>
        Add criteria
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
