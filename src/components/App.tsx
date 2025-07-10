// src/components/App.tsx
import React, { useMemo, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  InputGroup,
  FormControl,
  Form,
  OverlayTrigger,
  Tooltip,
  Modal,
} from 'react-bootstrap';
import Select, { type MultiValue } from 'react-select';
import { usePlayers } from '../hooks/usePlayers';
import { useSelection } from '../hooks/useSelection';
import { useTeams } from '../hooks/useTeams';
import { useModal } from '../hooks/useModal';
import { PlayerTable } from './PlayerTable';
import { TeamsDisplay } from './TeamsDisplay';
import { PlayerModal } from './PlayerModal';
import type { Player, PlayerFormData } from '../types/player';

export const App: React.FC = () => {
  const { players, setPlayers } = usePlayers([]);
  const { selected, toggle, selectAll } = useSelection<number>();
  const { teams, show, split, teamColors, setTeamColor } = useTeams();
  const { isOpen, data: editingPlayer, open, close } = useModal<Player | null>();
  const [showTeamsModal, setShowTeamsModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  const filteredPlayers = players.filter(p =>
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nickname.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (tagFilter.length === 0 || p.tags?.some(tag => tagFilter.includes(tag)))
  );

  const [formData, setFormData] = useState<PlayerFormData & { tags: string[] }>({
    name: '',
    nickname: '',
    rating: 5,
    tags: [],
  });
  const [teamsCount, setTeamsCount] = useState<number | string>(2);
  const [shareLink, setShareLink] = useState('');
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isCopiedTeams, setIsCopiedTeams] = useState(false);

  const availableTags = useMemo(() => {
    const allTags = players.flatMap(p => p.tags);
    return Array.from(new Set(allTags)).filter(Boolean);
  }, [players]);

  const handleSplit = () => {
    if (selected.length > 1 && typeof teamsCount === 'number') {
      split(players, selected, teamsCount);
    }
    setShowTeamsModal(true);
  };

  const handleShare = () => {
    const payload = encodeURIComponent(JSON.stringify(players));
    const url = `${window.location.origin}${window.location.pathname}?players=${payload}`;
    setShareLink(url);
    navigator.clipboard.writeText(url).catch(() => {});
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 3000);
  };

  const handleCopyTeams = () => {
    if (!show || teams.length === 0) return;
    const text = teams
        .map(
            (team, idx) =>
                `Команда ${idx + 1}${teamColors[idx] ? ` (${teamColors[idx].name})` : ''}:
` +
                team.map((p, idx) => `${idx + 1}. ${p.name}${p.nickname ? ` (${p.nickname})` : ''}`).join('\n')
        )
        .join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setIsCopiedTeams(true);
      setTimeout(() => setIsCopiedTeams(false), 3000);
    });
  };

  const openAdd = () => {
    setFormData({ name: '', nickname: '', rating: 5, tags: [] });
    open(null);
  };

  const openEdit = (p: Player) => {
    setFormData({ name: p.name, nickname: p.nickname, rating: p.rating, tags: p.tags });
    open(p);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const exists = players.some(
        p =>
            p.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
            (!editingPlayer || p.id !== editingPlayer.id)
    );
    if (exists) return;

    if (editingPlayer) {
      setPlayers(prev => prev.map(p => (p.id === editingPlayer.id ? { ...p, ...formData } : p)));
    } else {
      setPlayers(prev => [...prev, { id: Date.now(), ...formData }]);
    }

    close();
  };

  const onDelete = (id: number) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  return (
      <Container className="py-4 text-light bg-dark min-vh-100">
        <div className="mx-auto" style={{ maxWidth: 900 }}>
          <h1 className="text-center mb-4">Балансировщик команд</h1>
          <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="split-tooltip">
                  Для того чтобы сгенерировать команды необходимо:
                  <br />
                  {!players.length && '- добавить игроков в базу'}
                  <br />
                  - выбрать минимум 2 игроков из таблицы игроков.
                </Tooltip>
              }
          >
            <Button variant="info" className="mb-3 d-flex align-items-center">
              Как это работает?
            </Button>
          </OverlayTrigger>

          <Row className="mb-4 align-items-center justify-content-center gap-3 sticky-top shadow">
            <Col xs="auto" className="d-flex align-items-center p-2">
              <Form.Label className="mb-0 me-2">Количество команд:</Form.Label>
              <InputGroup style={{ width: 80 }}>
                <FormControl
                    type="number"
                    min={2}
                    max={players.length}
                    value={teamsCount}
                    onChange={e => setTeamsCount(e.target.value && Number(e.target.value))}
                    className="text-center"
                />
              </InputGroup>
              <Button
                  className="ms-3 d-flex align-items-center gap-2"
                  onClick={handleSplit}
                  disabled={selected.length < 2 || typeof teamsCount !== 'number'}
              >
                Разделить
              </Button>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs="6">
              <InputGroup>
                <FormControl
                    placeholder="Поиск"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label="Поиск по имени или нику"
                />
              </InputGroup>
            </Col>
            <Col xs="6">
              <Select
                  className={'text-dark'}
                  isMulti
                  options={availableTags.map(tag => ({ value: tag, label: tag }))}
                  value={tagFilter.map(tag => ({ value: tag, label: tag }))}
                  onChange={(newValue: MultiValue<{ value: string; label: string }>) =>
                      setTagFilter(newValue.map(opt => opt.value))
                  }
                  placeholder="Фильтр по тегам"
              />
            </Col>
          </Row>

          {filteredPlayers.length > 0 ? (
              <PlayerTable
                  players={filteredPlayers}
                  selected={selected}
                  onToggle={toggle}
                  onSelectAll={() => selectAll(players.map(p => p.id))}
                  onEdit={openEdit}
                  onDelete={onDelete}
              />
          ) : (
              <div className="text-center text-info p-2 my-3">Игроки не найдены.</div>
          )}
        </div>

        <Row className="mt-4 align-items-center gap-3">
          <Col xs="auto">
            <Button variant="success" onClick={openAdd}>
              + Добавить игрока в базу
            </Button>
          </Col>
          {!!players.length && (
              <Col xs="auto">
                <Button variant="info" onClick={handleShare}>
                  Поделиться базой игроков
                </Button>
              </Col>
          )}
          <Col xs="auto">
            {shareLink && (
                <InputGroup>
                  <FormControl
                      readOnly
                      value={shareLink}
                      aria-label="Ссылка для совместного доступа к базе игроков"
                  />
                  <Button variant="outline-secondary" disabled={isCopiedLink} onClick={handleShare}>
                    {isCopiedLink ? 'Скопировано!' : 'Копировать'}
                  </Button>
                </InputGroup>
            )}
          </Col>
        </Row>

        <PlayerModal
            availableTags={availableTags}
            show={isOpen}
            title={editingPlayer ? 'Сохранить' : 'Добавить'}
            formData={formData}
            onChange={setFormData}
            onSubmit={onSubmit}
            onClose={close}
        />

        <Modal show={showTeamsModal} onHide={() => setShowTeamsModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Сгенерированные команды</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TeamsDisplay teams={teams} teamColors={teamColors} setTeamColor={setTeamColor} />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSplit}>Переделить команды</Button>
            <Button variant="warning" disabled={!show || teams.length === 0} onClick={handleCopyTeams}>
              {isCopiedTeams ? 'Скопировано!' : 'Копировать'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};