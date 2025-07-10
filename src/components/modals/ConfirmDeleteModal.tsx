// src/components/modals/ConfirmDeleteModal.tsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConfirmDeleteModalProps {
  show: boolean;
  count: number;
  onHide: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  show,
  count,
  onHide,
  onConfirm,
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Удаление игроков</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Удалить {count} {count === 1 ? 'игрока' : 'игроков'}?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Отмена
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        Удалить
      </Button>
    </Modal.Footer>
  </Modal>
);
