// src/components/modals/HowItWorksModal.tsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface HowItWorksModalProps {
  show: boolean;
  onHide: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ show, onHide }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Как это работает?</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ul>
        <li>Нажмите «Добавить игрока» для создания игрока.</li>
        <li>Выберите минимум 2 игроков в таблице игроков (через "чекбоксы" в левой колонке).</li>
        <li>Нажмите кнопку "Создать команды"</li>
      </ul>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Закрыть
      </Button>
    </Modal.Footer>
  </Modal>
);
