import React from 'react';
import {Row, Col} from 'react-bootstrap';
import type {Player} from '../types/player';

interface Props {
    teams: Player[][];
}

export const TeamsDisplay: React.FC<Props> = ({teams}) => (
    <Row className="mb-4 justify-content-center">
        {teams.map((team, idx) => (
            <Col key={idx} xs={12} md={6} className="mb-3">
                <div className="bg-secondary p-3 rounded text-light">
                    <h5 className="text-center">Команда {idx + 1}</h5>
                    <ul className="list-unstyled mb-3">
                        {team.map((p) => (
                            <li key={p.id}>
                                {p.name} {p.nickname && `(${p.nickname})`}
                            </li>
                        ))}
                    </ul>
                    <h5>Суммарный рейтинг: {team.reduce((acc, player) => acc + Number(player.rating), 0)}</h5>
                </div>
            </Col>
        ))}
    </Row>
);
