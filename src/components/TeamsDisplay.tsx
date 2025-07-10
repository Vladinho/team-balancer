import React from 'react';
import { Row, Col, Dropdown } from 'react-bootstrap';
import type { Player } from '../types/player';
import type { Color } from '../types/color';

const colors: Color[] = [
  { name: 'белые', hex: '#ffffff' },
  { name: 'черные', hex: '#000000' },
  { name: 'красные', hex: '#ff0000' },
  { name: 'зеленые', hex: '#00ff00' },
  { name: 'синие', hex: '#0000ff' },
  { name: 'желтые', hex: '#ffff00' },
  { name: 'фиолетовые', hex: '#800080' },
];

interface Props {
  teams: Player[][];
  teamColors: Record<number, Color>;
  setTeamColor: (id: number, color: Color) => void;
}

export const TeamsDisplay: React.FC<Props> = ({ teams, teamColors, setTeamColor }) => (
  <Row className="mb-4 justify-content-center">
    {teams.map((team, idx) => (
      <Col key={idx} xs={12} md={6} className="mb-3">
        <div className="bg-secondary p-3 rounded text-light">
          {/* Заголовок и выбор цвета */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Команда {idx + 1}</h5>
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                id={`team-color-dropdown-${idx}`}
                style={{
                  maxWidth: '150px',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {teamColors[idx] ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: teamColors[idx].hex,
                        border: '1px solid black',
                        marginRight: 8,
                      }}
                    />
                    {teamColors[idx].name}
                  </>
                ) : (
                  'Цвет не выбран'
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {colors.map((c) => (
                  <Dropdown.Item key={c.hex} onClick={() => setTeamColor(idx, c)}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: '1px solid black',
                        marginRight: 8,
                      }}
                    />
                    {c.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <ul className="list-unstyled mb-3">
            {team.map((p, idx) => (
              <li key={p.id} style={{ wordBreak: 'break-word' }}>
                {idx + 1}. {p.name} {p.nickname && `(${p.nickname})`}
              </li>
            ))}
          </ul>

          <h5>Суммарный рейтинг: {team.reduce((acc, player) => acc + Number(player.rating), 0)}</h5>
        </div>
      </Col>
    ))}
  </Row>
);
