// src/components/App.tsx
import React, { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    InputGroup,
    FormControl,
    Form
} from 'react-bootstrap';
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
    const { teams, show, split } = useTeams();
    const { isOpen, data: editingPlayer, open, close } = useModal<Player | null>();

    const [formData, setFormData] = useState<PlayerFormData>({
        name: '',
        nickname: '',
        rating: 5,
    });
    const [teamsCount, setTeamsCount] = useState(2);
    const [shareLink, setShareLink] = useState<string>('');
    const [isCopiedLink, setIsCopiedLink] = useState(false);
    const [isCopiedTeams, setIsCopiedTeams] = useState(false);

    const handleSplit = () => {
        split(players, selected, teamsCount);
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
            .map((team, idx) =>
                `Команда ${idx + 1}:\n` +
                team
                    .map(p => `${p.name}${p.nickname ? ` (${p.nickname})` : ''}`)
                    .join('\n')
            )
            .join('\n\n');
        navigator.clipboard.writeText(text).then(() => {
            setIsCopiedTeams(true);
            setTimeout(() => setIsCopiedTeams(false), 3000);
        });
    };

    const openAdd = () => {
        setFormData({ name: '', nickname: '', rating: 5 });
        open(null);
    };

    const openEdit = (p: Player) => {
        setFormData({ name: p.name, nickname: p.nickname, rating: p.rating });
        open(p);
    };

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
                prev.map((p) =>
                    p.id === editingPlayer.id ? { ...p, ...formData } : p
                )
            );
        } else {
            setPlayers((prev) => [...prev, { id: Date.now(), ...formData }]);
        }

        close();
    };

    const onDelete = (id: number) => {
        setPlayers((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <Container className="py-4 text-light bg-dark min-vh-100">
            <div className="mx-auto" style={{ maxWidth: 900 }}>
                <h1 className="text-center mb-4">Балансировщик команд</h1>

                <Row className="mb-4 align-items-center justify-content-center gap-3">
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
                        <Button
                            className="ms-3"
                            onClick={handleSplit}
                            disabled={selected.length < teamsCount}
                        >
                            Разделить
                        </Button>
                    </Col>
                </Row>

                <Row className="mb-4 align-items-center gap-3">
                    <Col xs="auto">
                        <Button variant="success" onClick={openAdd}>
                            + Добавить игрока
                        </Button>
                    </Col>
                    {!!players.length && <Col xs="auto">
                        <Button variant="info" onClick={handleShare}>
                            Поделиться базой игроков
                        </Button>
                    </Col>}
                    <Col xs="auto">
                        {shareLink && (
                            <InputGroup>
                                <FormControl
                                    readOnly
                                    value={shareLink}
                                    aria-label="Ссылка для совместного доступа к базе игроков"
                                />
                                <Button
                                    variant="outline-secondary"
                                    disabled={isCopiedLink}
                                    onClick={handleShare}
                                >
                                    {isCopiedLink ? 'Скопировано!' : 'Копировать'}
                                </Button>
                            </InputGroup>
                        )}
                    </Col>
                    {!!teams.length && <Col xs="auto">
                        <Button
                            variant="warning"
                            disabled={!show || teams.length === 0}
                            onClick={handleCopyTeams}
                        >
                            {isCopiedTeams ? 'Скопировано!' : 'Скопировать команды'}
                        </Button>
                    </Col>}
                </Row>

                {show && teams.length > 0 && <TeamsDisplay teams={teams} />}

                {players.length > 0 && (
                    <PlayerTable
                        players={players}
                        selected={selected}
                        onToggle={toggle}
                        onSelectAll={() => selectAll(players.map((p) => p.id))}
                        onEdit={openEdit}
                        onDelete={onDelete}
                    />
                )}
            </div>

            <PlayerModal
                show={isOpen}
                title={editingPlayer ? 'Сохранить' : 'Добавить'}
                formData={formData}
                onChange={setFormData}
                onSubmit={onSubmit}
                onClose={close}
            />
        </Container>
    );
};