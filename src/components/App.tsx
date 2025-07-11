import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button, InputGroup, FormControl, Form } from 'react-bootstrap';
import Select, { type MultiValue } from 'react-select';
import { usePlayers } from '../hooks/usePlayers';
import { useSelection } from '../hooks/useSelection';
import { useTeams } from '../hooks/useTeams';
import { useModal } from '../hooks/useModal';
import { PlayerTable } from './PlayerTable';
import { PlayerModal } from './PlayerModal';
import type { Player, PlayerFormData } from '../types/player';
import { HowItWorksModal } from './modals/HowItWorksModal.tsx';
import { ConfirmDeleteModal } from './modals/ConfirmDeleteModal.tsx';
import { BulkAddTagsModal } from './modals/BulkAddTagsModal.tsx';
import { BulkDeleteTagsModal } from './modals/BulkDeleteTagsModal.tsx';
import { TeamsModal } from './modals/TeamsModal.tsx';

export const App: React.FC = () => {
  const { players, setPlayers } = usePlayers([]);
  const { selected, toggle, selectAll } = useSelection<number>();
  const { teams, show, split, teamColors, setTeamColor } = useTeams();
  const { isOpen, data: editingPlayer, open, close } = useModal<Player | null>();

  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isShareLinkVisible, setIsShareLinkVisible] = useState(false);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddTagsModal, setShowAddTagsModal] = useState(false);
  const [showDeleteTagsModal, setShowDeleteTagsModal] = useState(false);

  // Внутри App:
  const [splitTag, setSplitTag] = useState<string>('');

  const commonTags = useMemo<string[]>(() => {
    if (selected.length < 2) return [];
    const selPlayers = players.filter((p) => selected.includes(p.id));
    // начинаем с тегов первого игрока, а потом оставляем только те, что есть у всех
    return selPlayers.reduce<string[]>(
      (common, p, i) =>
        i === 0 ? [...(p.tags ?? [])] : common.filter((tag) => p.tags?.includes(tag)),
      []
    );
  }, [players, selected]);

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
  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    nickname: '',
    rating: 5,
    tags: [],
    tagRatings: {},
  });

  const [teamsCount, setTeamsCount] = useState<number | string>(2);
  const [shareLink, setShareLink] = useState('');
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // Все уникальные теги
  const availableTags = useMemo(() => {
    const all = players.flatMap((p) => p.tags);
    return Array.from(new Set(all)).filter(Boolean) as string[];
  }, [players]);

  // Разделение команд
  const handleSplit = () => {
    if (selected.length > 1 && typeof teamsCount === 'number') {
      split(players, selected, teamsCount, splitTag);
      setShowTeamsModal(true);
    }
  };

  // Поделиться ссылкой
  const handleShare = (isCopyAction = false) => {
    const selectedPlayers = players.filter((p) => selected.includes(p.id));
    const payload = encodeURIComponent(JSON.stringify(selectedPlayers));
    const url = `${window.location.origin}${window.location.pathname}?players=${payload}`;
    setShareLink(url);
    if (isCopyAction) {
      navigator.clipboard.writeText(url).catch(() => {});
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 3000);
    }
  };

  // Открытие модалки добавления игрока
  const openAdd = () => {
    setFormData({ name: '', nickname: '', rating: 5, tags: [], tagRatings: {} });
    open(null);
  };
  // Открытие модалки редактирования
  const openEdit = (p: Player) => {
    setFormData({
      name: p.name,
      nickname: p.nickname,
      rating: p.rating,
      tags: p.tags ?? [],
      tagRatings: p.tagRatings,
    });
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

  useEffect(() => {
    setIsShareLinkVisible(false);
    setShareLink('');
  }, [selected]);

  const handleCreateOption = (inputValue: string) => {
    const newTag = inputValue.trim();
    if (!newTag) return;
    // Добавляем новый тег к выбранным для массового добавления
    setBulkTags((prev) => (prev.includes(newTag) ? prev : [...prev, newTag]));
  };

  return (
    <Container className="py-4 text-light bg-dark min-vh-100">
      <Row>
        <Col>
          <h3 className="mb-4 flex-shrink-1">Балансировщик команд</h3>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          <Button variant="info" className="mb-3" onClick={() => setShowHowItWorks(true)}>
            Как это работает?
          </Button>
        </Col>
      </Row>

      {/* Параметры разделения */}
      <Row className="mb-4 sticky-top bg-dark p-2 shadow">
        <Col xs="auto" className="d-flex align-items-center">
          <div className={'flex-row flex-shrink-1'} style={{width: '50px'}}>
            <Form.Label className="mb-0 me-2" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
              Команд:
            </Form.Label>
            <InputGroup>
              <FormControl
                  type="number"
                  min={2}
                  max={players.length}
                  value={teamsCount}
                  onChange={(e) => setTeamsCount(e.target.value ? Number(e.target.value) : '')}
                  className="text-center"
              />
            </InputGroup>
          </div>


          {commonTags.length > 0 && (
            <div className="ms-3" style={{ minWidth: 120, alignSelf: 'end' }}>
              <Select
                className="text-dark"
                options={commonTags.map((t) => ({ value: t, label: t }))}
                value={splitTag ? { value: splitTag, label: splitTag } : null}
                onChange={(opt) => setSplitTag(opt?.value ?? '')}
                placeholder="По тегу"
                isClearable
              />
            </div>
          )}

          <Button className="ms-3 create-btn" onClick={handleSplit} disabled={selected.length < 2}>
            Создать команды
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
        {!!availableTags.length && (
          <Col xs={6}>
            <Select
              className="text-dark"
              isMulti
              options={availableTags.map((t) => ({ value: t, label: t }))}
              value={tagFilter.map((t) => ({ value: t, label: t }))}
              onChange={(v: MultiValue<{ value: string; label: string }>) =>
                setTagFilter(v.map((opt) => opt.value))
              }
              placeholder="Теги"
            />
          </Col>
        )}
      </Row>

      {/* Таблица */}
      {filteredPlayers.length ? (
        <PlayerTable
          players={filteredPlayers}
          selected={selected}
          onToggle={toggle}
          onSelectAll={() => selectAll(filteredPlayers.map((p) => p.id))}
          onDeselectAll={() => selectAll([])}
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
            + Добавить игрока в базу
          </Button>
        </Col>
        {selected.length > 0 && (
          <Col xs="auto">
            <Button
              variant="info"
              onClick={() => {
                setIsShareLinkVisible((p) => !p);
                handleShare();
              }}
            >
              Поделиться базой выбранных игроков
            </Button>
          </Col>
        )}
        {shareLink && isShareLinkVisible && (
          <Col xs="auto">
            <InputGroup>
              <FormControl readOnly value={shareLink} />
              <Button variant="outline-secondary" onClick={() => handleShare(true)}>
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

      {/* Modals */}
      <HowItWorksModal show={showHowItWorks} onHide={() => setShowHowItWorks(false)} />

      <PlayerModal
        availableTags={availableTags}
        show={isOpen}
        title={editingPlayer ? 'Сохранить' : 'Добавить'}
        formData={formData}
        onChange={setFormData}
        onSubmit={onSubmit}
        onClose={close}
      />

      <ConfirmDeleteModal
        show={showDeleteModal}
        count={selected.length}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleBulkDelete}
      />

      <BulkAddTagsModal
        show={showAddTagsModal}
        availableTags={availableTags}
        selectedTags={bulkTags}
        onHide={() => setShowAddTagsModal(false)}
        onChange={setBulkTags}
        onCreateOption={handleCreateOption}
        onConfirm={handleConfirmBulkAddTags}
      />

      <BulkDeleteTagsModal
        show={showDeleteTagsModal}
        count={selected.length}
        onHide={() => setShowDeleteTagsModal(false)}
        onConfirm={() => {
          setPlayers((prev) => prev.map((p) => (selected.includes(p.id) ? { ...p, tags: [] } : p)));
          setShowDeleteTagsModal(false);
        }}
      />

      <TeamsModal
        show={showTeamsModal}
        teams={teams}
        teamColors={teamColors}
        setTeamColor={setTeamColor}
        onHide={() => setShowTeamsModal(false)}
        onRedo={handleSplit}
        canCopy={show && teams.length > 0}
        splitTag={splitTag}
      />
    </Container>
  );
};
