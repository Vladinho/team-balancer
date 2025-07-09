import React, { type FormEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import type { PlayerFormData } from '../types/player';

interface Props {
  show: boolean;
  formData: PlayerFormData;
  onChange: (data: PlayerFormData) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
  title: string;
}

export const PlayerModal: React.FC<Props> = ({
  show,
  formData,
  onChange,
  onSubmit,
  onClose,
  title,
}) => (
  <Modal show={show} onHide={onClose} centered>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Form onSubmit={onSubmit}>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Имя</Form.Label>
          <Form.Control
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>
            Ник <span className="text-secondary">(опционально)</span>
          </Form.Label>
          <Form.Control
            type="text"
            value={formData.nickname}
            onChange={(e) => onChange({ ...formData, nickname: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Рейтинг</Form.Label>
          <Form.Control
            type="number"
            min={1}
            max={100}
            value={formData.rating}
            onChange={(e) => onChange({ ...formData, rating: e.target.value && Number(e.target.value) })}
            required
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="primary" type="submit">
          {title}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);
