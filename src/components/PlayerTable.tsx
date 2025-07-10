import React from 'react';
import { Table, Form, Dropdown, Badge, Button } from 'react-bootstrap';
import type { Player } from '../types/player';

interface PlayerTableProps {
  players: Player[];
  selected: number[];
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onEdit: (p: Player) => void;
  onDelete: (id: number) => void;
  onBulkDelete: () => void;
}

export const PlayerTable: React.FC<PlayerTableProps> = ({
                                                          players,
                                                          selected,
                                                          onToggle,
                                                          onSelectAll,
                                                          onEdit,
                                                          onDelete,
                                                          onBulkDelete,
                                                        }) => (
    <Table bordered hover variant="dark" responsive className="text-center mb-0">
      <thead>
      <tr>
        <th>
          <Form.Check
              checked={selected.length === players.length && players.length > 0}
              onChange={onSelectAll}
          />
        </th>
        <th>#</th>
        <th>Имя</th>
        <th>Ник</th>
        <th>Рейтинг</th>
        <th>Теги</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      {players.map((p, i) => (
          <tr key={p.id} className={selected.includes(p.id) ? 'table-primary' : ''}>
            <td>
              <Form.Check
                  checked={selected.includes(p.id)}
                  onChange={() => onToggle(p.id)}
              />
            </td>
            <td>{i + 1}</td>
            <td>{p.name}</td>
            <td>{p.nickname || '-'}</td>
            <td>{p.rating}</td>
            <td>
              {p.tags?.map(t => (
                  <Badge key={t} bg="secondary" className="me-1">
                    {t}
                  </Badge>
              ))}
            </td>
            <td>
              <Dropdown>
                <Dropdown.Toggle variant="outline-light" size="sm">
                  ⋮
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => onEdit(p)}>
                    Редактировать
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => onDelete(p.id)} className="text-danger">
                    Удалить
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </td>
          </tr>
      ))}
      </tbody>
      {selected.length > 0 && (
          <tfoot>
          <tr>
            <td colSpan={7} className="bg-dark" style={{textAlign: 'left'}}>
              <Button variant="danger" size="sm" onClick={onBulkDelete}>
                Удалить выбранных ({selected.length})
              </Button>
            </td>
          </tr>
          </tfoot>
      )}
    </Table>
);