import { useEffect, useState } from "react";
import { Modal, Button } from "~/components/ui";
import { useData } from "~/context/DataContext";
import type { Campaign } from "~/types/domain";
import { CampaignForm } from "./CampaignForm";
import {
  emptyCampaignValues,
  validateCampaign,
  valuesFromCampaign,
  valuesToCampaignInput,
  type CampaignFormValues,
  type CampaignFormErrors,
} from "./campaignModel";

interface CampaignFormModalProps {
  open: boolean;
  onClose: () => void;
  /** provide to edit an existing campaign; omit to create */
  campaignId?: string;
  /** initial values (e.g. prefilled from an event) for create mode */
  initialValues?: CampaignFormValues;
  onSaved?: (campaign: Campaign) => void;
}

export function CampaignFormModal({
  open,
  onClose,
  campaignId,
  initialValues,
  onSaved,
}: CampaignFormModalProps) {
  const { campaigns, createCampaign, updateCampaign } = useData();
  const editing = campaignId
    ? campaigns.find((c) => c.id === campaignId)
    : undefined;

  const [values, setValues] = useState<CampaignFormValues>(
    () => initialValues ?? emptyCampaignValues(),
  );
  const [errors, setErrors] = useState<CampaignFormErrors>({});

  // Reset the form whenever the modal opens with a new target.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setValues(valuesFromCampaign(editing));
    } else {
      setValues(initialValues ?? emptyCampaignValues());
    }
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, campaignId]);

  const patch = (p: Partial<CampaignFormValues>) =>
    setValues((v) => ({ ...v, ...p }));

  const handleSave = () => {
    const validation = validateCampaign(values);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    const input = valuesToCampaignInput(values);
    let saved: Campaign | undefined;
    if (editing) {
      updateCampaign(editing.id, input);
      saved = { ...editing, ...input };
    } else {
      saved = createCampaign(input);
    }
    if (saved) onSaved?.(saved);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit campaign" : "New campaign"}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editing ? "Save changes" : "Create campaign"}
          </Button>
        </>
      }
    >
      <CampaignForm
        values={values}
        onChange={patch}
        errors={errors}
        showStatus={Boolean(editing)}
      />
    </Modal>
  );
}
