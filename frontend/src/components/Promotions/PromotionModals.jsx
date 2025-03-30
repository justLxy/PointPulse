import React from 'react';
import Modal from '../common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

// 🟢 创建和编辑用的表单内容
const PromotionFormFields = ({ promotionData, onChange }) => {
  return (
    <>
      <Input
        label="Name"
        value={promotionData.name}
        onChange={(e) => onChange('name', e.target.value)}
        required
      />

      <Input
        label="Description"
        value={promotionData.description}
        onChange={(e) => onChange('description', e.target.value)}
        multiline
        rows={3}
        required
      />

      <Select
        label="Type"
        value={promotionData.type}
        onChange={(e) => onChange('type', e.target.value)}
      >
        <option value="automatic">Automatic</option>
        <option value="one-time">One-time</option>
      </Select>

      {promotionData.type === 'automatic' && (
        <>
          <Input
            label="Minimum Spending ($)"
            type="number"
            value={promotionData.minSpending}
            onChange={(e) => onChange('minSpending', e.target.value)}
          />
          <Input
            label="Rate"
            type="number"
            step="0.01"
            value={promotionData.rate}
            onChange={(e) => onChange('rate', e.target.value)}
            required
          />
        </>
      )}

      {promotionData.type === 'one-time' && (
        <Input
          label="Points"
          type="number"
          value={promotionData.points}
          onChange={(e) => onChange('points', e.target.value)}
          required
        />
      )}

      <Input
        label="Start Date"
        type="date"
        value={promotionData.startDate}
        onChange={(e) => onChange('startDate', e.target.value)}
      />

      <Input
        label="End Date"
        type="date"
        value={promotionData.endDate}
        onChange={(e) => onChange('endDate', e.target.value)}
      />
    </>
  );
};

// 🔵 Create Modal
export const CreatePromotionModal = ({ isOpen, onClose, promotionData, onChange, onSubmit, isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Create New Promotion" size="medium">
    <div className="flex flex-col gap-4">
      <PromotionFormFields promotionData={promotionData} onChange={onChange} />
      <div className="flex gap-4 mt-4">
        <Button variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={onSubmit} loading={isLoading}>Create</Button>
      </div>
    </div>
  </Modal>
);

// 🟡 Edit Modal
export const EditPromotionModal = ({ isOpen, onClose, promotionData, selectedPromotion, onChange, onSubmit, isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={`Edit Promotion: ${selectedPromotion?.name || ''}`} size="medium">
    <div className="flex flex-col gap-4">
      <PromotionFormFields promotionData={promotionData} onChange={onChange} />
      <div className="flex gap-4 mt-4">
        <Button variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={onSubmit} loading={isLoading}>Update</Button>
      </div>
    </div>
  </Modal>
);

// 🔴 Delete Modal
export const DeletePromotionModal = ({ isOpen, onClose, selectedPromotion, onDelete, isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Delete Promotion" size="small">
    <div className="flex flex-col gap-4">
      <p>Are you sure you want to delete this promotion?</p>
      <strong>{selectedPromotion?.name}</strong>
      <p>This action cannot be undone.</p>
      <div className="flex gap-4 mt-4">
        <Button variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button color="error" onClick={onDelete} loading={isLoading}>Delete</Button>
      </div>
    </div>
  </Modal>
);
