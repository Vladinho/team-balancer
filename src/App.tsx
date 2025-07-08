import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Dropdown,
  InputGroup,
  FormControl,
} from 'react-bootstrap';

interface Player {
  id: number;
  name: string;
  nickname: string;
  rating: number;
}

interface PlayerFormData {
  name: string;
  nickname: string;
  rating: number;
}

const initialPlayers: Player[] = [];

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [teamsCount, setTeamsCount] = useState(2);
  const [showTeams, setShowTeams] = useState(false);
  const [teams, setTeams] = useState<Player[][]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>({ name: '', nickname: '', rating: 5 });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('teamBalancerPlayers');
    if (saved) {
      try {
        setPlayers(JSON.parse(saved));
      } catch {
        setPlayers(initialPlayers);
      }
    } else {
      setPlayers(initialPlayers);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      if (players.length > 0 || localStorage.getItem('teamBalancerPlayers') !== null) {
        localStorage.setItem('teamBalancerPlayers', JSON.stringify(players));
      }
    }
  }, [players, isInitialized]);

  const handleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    setSelected((prev) => (prev.length === players.length ? [] : players.map((p) => p.id)));
  };

  const splitTeams = () => {
    const sel = players.filter((p) => selected.includes(p.id));
    const sorted = [...sel].sort((a, b) => b.rating - a.rating);

    const newTeams: Player[][] = Array.from({ length: teamsCount }, () => []);
    const teamSums: number[] = Array(teamsCount).fill(0);

    sorted.forEach((p) => {
      // находим минимальную сумму
      const minSum = Math.min(...teamSums);
      // собираем все команды с этой суммой
      const candidates = teamSums
        .map((sum, idx) => (sum === minSum ? idx : -1))
        .filter((idx) => idx !== -1);
      // выбираем случайный индекс из кандидатов
      const idx = candidates[Math.floor(Math.random() * candidates.length)];

      newTeams[idx].push(p);
      teamSums[idx] += p.rating;
    });

    setTeams(newTeams);
    setShowTeams(true);
  };

  const openAddModal = () => {
    setEditingPlayer(null);
    setFormData({ name: '', nickname: '', rating: 5 });
    setShowModal(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setFormData({ name: player.name, nickname: player.nickname, rating: player.rating });
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
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
    setShowModal(false);
  };

  const deletePlayer = (id: number) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => prev.filter((pid) => pid !== id));
  };

  return (
    <Container className="py-4 text-light bg-dark min-vh-100">
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        <h1 className="text-center mb-4">Балансировщик команд</h1>
        <Row className="mb-4 align-items-center justify-content-center gap-3">
          <Col xs="auto">
            <Button variant="success" onClick={openAddModal}>
              + Добавить игрока
            </Button>
          </Col>
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
            <Button className="ms-3" onClick={splitTeams} disabled={selected.length < teamsCount}>
              Разделить
            </Button>
          </Col>
        </Row>

        {showTeams && teams.length > 0 && (
          <>
            <h2 className="h5 text-center mb-3">Составы команд:</h2>
            <Row className="mb-4 justify-content-center">
              {teams.map((team, idx) => (
                <Col key={idx} xs={12} md={6} className="mb-3">
                  <div className="bg-secondary p-3 rounded text-light">
                    <h5 className="text-center">Команда {idx + 1}</h5>
                    <ul className="list-unstyled mb-0">
                      {team.map((p) => (
                        <li key={p.id}>
                          {p.name} {p.nickname && `(${p.nickname})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Col>
              ))}
            </Row>
          </>
        )}

        {players.length && (
          <Table bordered hover variant="dark" responsive className="text-center">
            <thead>
              <tr>
                <th>
                  <Form.Check
                    checked={selected.length === players.length && players.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th></th>
                <th>Имя</th>
                <th>Ник</th>
                <th>Рейтинг</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.id} className={selected.includes(p.id) ? 'table-primary' : ''}>
                  <td>
                    <Form.Check
                      checked={selected.includes(p.id)}
                      onChange={() => handleSelect(p.id)}
                    />
                  </td>
                  <td>{i + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.nickname || '-'}</td>
                  <td>{p.rating}</td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-light" size="sm">
                        ⋮
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => openEditModal(p)}>
                          Редактировать
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => deletePlayer(p.id)} className="text-danger">
                          Удалить
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingPlayer ? 'Редактировать игрока' : 'Добавить игрока'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, nickname: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Рейтинг</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={100}
                value={formData.rating}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rating: Number(e.target.value) }))
                }
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              {editingPlayer ? 'Сохранить' : 'Добавить'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default App;
