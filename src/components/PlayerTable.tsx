import React, { useState, useMemo } from 'react';
import { Table, Form, Dropdown, Badge, Button } from 'react-bootstrap';
import type { Player } from '../types/player';

interface PlayerTableProps {
  players: Player[];
  selected: number[];
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onEdit: (p: Player) => void;
  onDelete: (id: number) => void;
  onBulkDelete: () => void;
  onBulkAddTags: () => void;
  onBulkDeleteTags: () => void;
}

type SortDirection = 'asc' | 'desc';

export const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkAddTags,
  onBulkDeleteTags,
}) => {
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: SortDirection | null;
  }>({
    key: null,
    direction: null,
  });

  const toggleSort = (key: string) => {
    if (sortConfig.key !== key) {
      setSortConfig({ key, direction: 'asc' });
    } else if (sortConfig.direction === 'asc') {
      setSortConfig({ key, direction: 'desc' });
    } else {
      setSortConfig({ key: null, direction: null });
    }
  };

  const getSortIndicator = (column: string) => {
    if (sortConfig.key !== column) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : sortConfig.direction === 'desc' ? ' ▼' : '';
  };

  // Gather all unique tags across players for dynamic columns
  const allTags = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [players]);

  // Memoized sorting including dynamic tag-rating columns
  const sortedPlayers = useMemo(() => {
    const { key, direction } = sortConfig;
    if (!key || !direction) return players;

    return [...players].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (key === 'name' || key === 'nickname' || key === 'rating') {
        aVal = a[key as keyof Player];
        bVal = b[key as keyof Player];
      } else {
        // dynamic tag rating column
        aVal = a.tagRatings?.[key] ?? 0;
        bVal = b.tagRatings?.[key] ?? 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [players, sortConfig]);

  return (
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
          <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
            Имя{getSortIndicator('name')}
          </th>
          <th onClick={() => toggleSort('nickname')} style={{ cursor: 'pointer' }}>
            Ник{getSortIndicator('nickname')}
          </th>
          <th onClick={() => toggleSort('rating')} style={{ cursor: 'pointer' }}>
            Рейтинг{getSortIndicator('rating')}
          </th>
          {/* Dynamic tag rating columns with sorting */}
          {allTags.map((tag) => (
            <th key={tag} onClick={() => toggleSort(tag)} style={{ cursor: 'pointer' }}>
              {tag} рейтинг{getSortIndicator(tag)}
            </th>
          ))}
          <th>Теги</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sortedPlayers.map((p, i) => (
          <tr key={p.id} className={selected.includes(p.id) ? 'table-primary' : ''}>
            <td>
              <Form.Check checked={selected.includes(p.id)} onChange={() => onToggle(p.id)} />
            </td>
            <td>{i + 1}</td>
            <td>{p.name}</td>
            <td>{p.nickname || '-'}</td>
            <td>{p.rating}</td>
            {/* Dynamic tag ratings per player */}
            {allTags.map((tag) => (
              <td key={tag}>{p.tagRatings?.[tag] ?? '-'}</td>
            ))}
            <td>
              {p.tags?.map((t) => (
                <Badge key={t} bg="secondary" className="me-1">
                  {t}
                </Badge>
              ))}
            </td>
            <td>
              <Dropdown>
                <Dropdown.Toggle variant="outline-light" size="sm" style={{ fontWeight: 'bold' }}>
                  ⋮
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => onEdit(p)}>Редактировать</Dropdown.Item>
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
            <td colSpan={7 + allTags.length} className="bg-dark" style={{ textAlign: 'left' }}>
              <Button variant="secondary" size="sm" className="me-2" onClick={onDeselectAll}>
                Снять выделение
              </Button>
              <Button variant="secondary" size="sm" className="me-2" onClick={onBulkAddTags}>
                Добавить теги
              </Button>

              {selected.some((id) =>
                players.some((i) => i.id === id && i.tags && i.tags.length > 0)
              ) && (
                <Button variant="secondary" size="sm" className="me-2" onClick={onBulkDeleteTags}>
                  Удалить теги
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={onBulkDelete}>
                Удалить выбранных ({selected.length})
              </Button>
            </td>
          </tr>
        </tfoot>
      )}
    </Table>
  );
};
