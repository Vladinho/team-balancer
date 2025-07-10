import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface BulkDeleteTagsModalProps {
  show: boolean;
  count: number;
  onHide: () => void;
  onConfirm: () => void;
}

export const BulkDeleteTagsModal: React.FC<BulkDeleteTagsModalProps> = ({
  show,
  count,
  onHide,
  onConfirm,
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Удаление тегов</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Вы уверены, что хотите удалить все теги у {count} {count === 1 ? 'игрока' : 'игроков'}?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Отмена
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        Удалить теги
      </Button>
    </Modal.Footer>
  </Modal>
);
