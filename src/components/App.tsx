// src/components/App.tsx
import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Button, InputGroup, FormControl, Modal, Form } from 'react-bootstrap';
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

  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddTagsModal, setShowAddTagsModal] = useState(false);
  const [showDeleteTagsModal, setShowDeleteTagsModal] = useState(false);

  // Фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [bulkTags, setBulkTags] = useState<string[]>([]);

  // Фильтрация списка игроков
  const filteredPlayers = players.filter(
    (p) =>
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nickname.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (tagFilter.length === 0 || p.tags?.some((tag) => tagFilter.includes(tag)))
  );

  // Состояние формы добавления/редактирования
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

  // Все уникальные теги
  const availableTags = useMemo(() => {
    const all = players.flatMap((p) => p.tags);
    return Array.from(new Set(all)).filter(Boolean) as string[];
  }, [players]);

  // Разделение команд
  const handleSplit = () => {
    if (selected.length > 1 && typeof teamsCount === 'number') {
      split(players, selected, teamsCount);
      setShowTeamsModal(true);
    }
  };

  // Поделиться ссылкой
  const handleShare = () => {
    const payload = encodeURIComponent(JSON.stringify(players));
    const url = `${window.location.origin}${window.location.pathname}?players=${payload}`;
    setShareLink(url);
    navigator.clipboard.writeText(url).catch(() => {});
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 3000);
  };

  // Копирование команд в буфер
  const handleCopyTeams = () => {
    if (!show || teams.length === 0) return;
    const text = teams
      .map(
        (team, idx) =>
          `Команда ${idx + 1}${teamColors[idx] ? ` (${teamColors[idx].name})` : ''}:
${team.map((p, i) => `${i + 1}. ${p.name}${p.nickname ? ` (${p.nickname})` : ''}`).join('\n')}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setIsCopiedTeams(true);
      setTimeout(() => setIsCopiedTeams(false), 3000);
    });
  };

  // Открытие модалки добавления игрока
  const openAdd = () => {
    setFormData({ name: '', nickname: '', rating: 5, tags: [] });
    open(null);
  };
  // Открытие модалки редактирования
  const openEdit = (p: Player) => {
    setFormData({ name: p.name, nickname: p.nickname, rating: p.rating, tags: p.tags ?? [] });
    open(p);
  };

  // Сохранение формы
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const exists = players.some(
      (p) =>
        p.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
        (!editingPlayer || p.id !== editingPlayer.id)
    );
    if (exists) return;
    if (editingPlayer) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === editingPlayer.id ? { ...p, ...formData } : p))
      );
    } else {
      setPlayers((prev) => [...prev, { id: Date.now(), ...formData }]);
    }
    close();
  };

  // Удаление одиночное и массовое
  const onDelete = (id: number) => setPlayers((prev) => prev.filter((p) => p.id !== id));
  const handleBulkDelete = () => {
    setPlayers((prev) => prev.filter((p) => !selected.includes(p.id)));
    selectAll([]);
    setShowDeleteModal(false);
  };

  // Подтверждение добавления тегов
  const handleConfirmBulkAddTags = () => {
    setPlayers((prev) =>
      prev.map((p) =>
        selected.includes(p.id)
          ? { ...p, tags: Array.from(new Set([...(p.tags ?? []), ...bulkTags])) }
          : p
      )
    );
    setBulkTags([]);
    setShowAddTagsModal(false);
  };

  return (
    <Container className="py-4 text-light bg-dark min-vh-100">
      <h1 className="text-center mb-4">Балансировщик команд</h1>
      <Button variant="info" className="mb-3" onClick={() => setShowHowItWorks(true)}>
        Как это работает?
      </Button>

      {/* Модалка "Как это работает?" */}
      <Modal show={showHowItWorks} onHide={() => setShowHowItWorks(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Как это работает?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            <li>Нажмите «Добавить игрока» для создания игрока.</li>
            <li>Выберите игроков в таблице игроков (через чекбоксы).</li>
            <li>Нажмите кнопку "Разделить"</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHowItWorks(false)}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Параметры разделения */}
      <Row className="mb-4 sticky-top bg-dark p-2 shadow">
        <Col xs="auto" className="d-flex align-items-center">
          <Form.Label className="mb-0 me-2">Количество команд:</Form.Label>
          <InputGroup style={{ width: 80 }}>
            <FormControl
              type="number"
              min={2}
              max={players.length}
              value={teamsCount}
              onChange={(e) => setTeamsCount(Number(e.target.value))}
              className="text-center"
            />
          </InputGroup>
          <Button className="ms-3" onClick={handleSplit} disabled={selected.length < 2}>
            Разделить
          </Button>
        </Col>
      </Row>

      {/* Фильтры */}
      <Row className="mb-3">
        <Col xs={6}>
          <InputGroup>
            <FormControl
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs={6}>
          <Select
            className="text-dark"
            isMulti
            options={availableTags.map((t) => ({ value: t, label: t }))}
            value={tagFilter.map((t) => ({ value: t, label: t }))}
            onChange={(v: MultiValue<{ value: string; label: string }>) =>
              setTagFilter(v.map((opt) => opt.value))
            }
            placeholder="Фильтр по тегам"
          />
        </Col>
      </Row>

      {/* Таблица */}
      {filteredPlayers.length ? (
        <PlayerTable
          players={filteredPlayers}
          selected={selected}
          onToggle={toggle}
          onSelectAll={() => selectAll(players.map((p) => p.id))}
          onEdit={openEdit}
          onDelete={onDelete}
          onBulkDelete={() => setShowDeleteModal(true)}
          onBulkAddTags={() => setShowAddTagsModal(true)}
          onBulkDeleteTags={() => setShowDeleteTagsModal(true)}
        />
      ) : (
        <div className="text-center text-info py-3">Игроки не найдены.</div>
      )}

      {/* Действия */}
      <Row className="mt-4 gap-3">
        <Col xs="auto">
          <Button variant="success" onClick={openAdd}>
            + Добавить игрока
          </Button>
        </Col>
        {players.length > 0 && (
          <Col xs="auto">
            <Button variant="info" onClick={handleShare}>
              Поделиться
            </Button>
          </Col>
        )}
        {shareLink && (
          <Col xs="auto">
            <InputGroup>
              <FormControl readOnly value={shareLink} />
              <Button variant="outline-secondary" onClick={handleShare}>
                {isCopiedLink ? 'Скопировано!' : 'Копировать'}
              </Button>
            </InputGroup>
          </Col>
        )}
      </Row>

      {/* Модалка игрока */}
      <PlayerModal
        availableTags={availableTags}
        show={isOpen}
        title={editingPlayer ? 'Сохранить' : 'Добавить'}
        formData={formData}
        onChange={setFormData}
        onSubmit={onSubmit}
        onClose={close}
      />

      {/* Подтверждение удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Удаление игроков</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Удалить {selected.length} {selected.length === 1 ? 'игрока' : 'игроков'}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleBulkDelete}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Добавление тегов */}
      <Modal show={showAddTagsModal} onHide={() => setShowAddTagsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Добавить теги выбранным игрокам</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Теги для добавления:</Form.Label>
            <Select
              isMulti
              options={availableTags.map((t) => ({ value: t, label: t }))}
              value={bulkTags.map((t) => ({ value: t, label: t }))}
              onChange={(v: MultiValue<{ value: string; label: string }>) =>
                setBulkTags(v.map((opt) => opt.value))
              }
              placeholder="Выберите теги..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddTagsModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleConfirmBulkAddTags}>
            Добавить
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Удаление тегов */}
      <Modal show={showDeleteTagsModal} onHide={() => setShowDeleteTagsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Удаление тегов</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить все теги у {selected.length}{' '}
          {selected.length === 1 ? 'игрока' : 'игроков'}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteTagsModal(false)}>
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setPlayers((prev) =>
                prev.map((p) => (selected.includes(p.id) ? { ...p, tags: [] } : p))
              );
              setShowDeleteTagsModal(false);
            }}
          >
            Удалить теги
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модалка команд */}
      <Modal show={showTeamsModal} onHide={() => setShowTeamsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Сгенерированные команды</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TeamsDisplay teams={teams} teamColors={teamColors} setTeamColor={setTeamColor} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSplit}>Переделить</Button>
          <Button variant="warning" onClick={handleCopyTeams} disabled={!show}>
            {isCopiedTeams ? 'Скопировано!' : 'Копировать'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
