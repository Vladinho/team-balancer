import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { TeamsDisplay } from '../TeamsDisplay';
import type { Player } from '../../types/player';
import type { Color } from '../../types/color';

interface TeamsModalProps {
  show: boolean;
  splitTag?: string;
  teams: Player[][];
  teamColors: Record<number, Color>;
  setTeamColor: (id: number, color: Color) => void;
  onHide: () => void;
  onRedo: () => void;
  canCopy: boolean;
}

export const TeamsModal: React.FC<TeamsModalProps> = ({
  show,
  splitTag,
  teams,
  teamColors,
  setTeamColor,
  onHide,
  onRedo,
  canCopy,
}) => {
  const [isCopiedTeams, setIsCopiedTeams] = useState(false);

  const handleCopyTeams = () => {
    if (!show || teams.length === 0) return;

    // Добавляем заголовок с учётом splitTag
    const text = teams
      .map(
        (team, idx) =>
          `Команда ${idx + 1}${teamColors[idx] ? ` (${teamColors[idx].name})` : ''}:\n` +
          team
            .map((p, i) => `${i + 1}. ${p.name}${p.nickname ? ` (${p.nickname})` : ''}`)
            .join('\n')
      )
      .join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setIsCopiedTeams(true);
      setTimeout(() => setIsCopiedTeams(false), 3000);
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Сгенерированные команды{splitTag ? ` по тегу "${splitTag}"` : ''}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TeamsDisplay
          teams={teams}
          teamColors={teamColors}
          setTeamColor={setTeamColor}
          splitTag={splitTag}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onRedo}>Переделить</Button>
        <Button variant="warning" onClick={handleCopyTeams} disabled={!canCopy}>
          {isCopiedTeams ? 'Скопировано' : 'Копировать'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
