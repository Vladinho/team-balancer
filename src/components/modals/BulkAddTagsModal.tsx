import React from 'react';
import Select from 'react-select/creatable';
import { Modal, Button, Form } from 'react-bootstrap';
import type { MultiValue } from 'react-select';

interface BulkAddTagsModalProps {
  show: boolean;
  availableTags: string[];
  selectedTags: string[];
  onHide: () => void;
  onChange: (tags: string[]) => void;
  onCreateOption: (input: string) => void;
  onConfirm: () => void;
}

export const BulkAddTagsModal: React.FC<BulkAddTagsModalProps> = ({
  show,
  availableTags,
  selectedTags,
  onHide,
  onChange,
  onCreateOption,
  onConfirm,
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Добавить теги выбранным игрокам</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form.Group>
        <Form.Label>Теги для добавления:</Form.Label>
        <Select
          formatCreateLabel={(input) => `Создать тег "${input}"`}
          noOptionsMessage={() => 'Нет доступных тегов'}
          value={selectedTags.map((t) => ({ value: t, label: t }))}
          isMulti
          options={availableTags.map((t) => ({ value: t, label: t }))}
          onChange={(v: MultiValue<{ value: string; label: string }>) =>
            onChange(v.map((opt) => opt.value))
          }
          onCreateOption={onCreateOption}
          placeholder="Выберите или создайте тег..."
        />
      </Form.Group>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Отмена
      </Button>
      <Button variant="primary" onClick={onConfirm}>
        Добавить
      </Button>
    </Modal.Footer>
  </Modal>
);
