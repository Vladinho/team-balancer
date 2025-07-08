import React, { useState, useEffect, useRef } from "react";

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

const initialPlayers: Player[] = [
    { id: 1, name: "Иван Иванов", nickname: "ivan123", rating: 90 },
    { id: 2, name: "Петр Петров", nickname: "petr", rating: 80 },
    { id: 3, name: "Сергей Сергеев", nickname: "serg", rating: 70 },
    { id: 4, name: "Алексей Алексеев", nickname: "alex", rating: 60 },
    { id: 5, name: "Дмитрий Дмитриев", nickname: "dima", rating: 85 },
];

const App: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [teamsCount, setTeamsCount] = useState(2);
    const [showTeams, setShowTeams] = useState(false);
    const [teams, setTeams] = useState<Player[][]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [formData, setFormData] = useState<PlayerFormData>({
        name: "",
        nickname: "",
        rating: 5
    });
    const [contextMenu, setContextMenu] = useState<{
        show: boolean;
        x: number;
        y: number;
        playerId: number;
    }>({ show: false, x: 0, y: 0, playerId: 0 });
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Загрузка данных из localStorage при инициализации
    useEffect(() => {
        const savedPlayers = localStorage.getItem('teamBalancerPlayers');
        console.log('Загружаем из localStorage:', savedPlayers);
        if (savedPlayers) {
            try {
                const parsedPlayers = JSON.parse(savedPlayers);
                console.log('Успешно загружено игроков:', parsedPlayers.length);
                setPlayers(parsedPlayers);
            } catch (error) {
                console.error('Ошибка при загрузке данных из localStorage:', error);
                setPlayers(initialPlayers);
            }
        } else {
            console.log('Нет сохраненных данных, используем начальные');
            setPlayers(initialPlayers);
        }
        setIsInitialized(true);
    }, []);

    // Сохранение данных в localStorage при изменении (только после инициализации)
    useEffect(() => {
        if (isInitialized) {
            console.log('Сохраняем в localStorage игроков:', players.length);
            // Сохраняем только если есть игроки или если это явное удаление (не пустой массив при инициализации)
            if (players.length > 0 || localStorage.getItem('teamBalancerPlayers') !== null) {
                localStorage.setItem('teamBalancerPlayers', JSON.stringify(players));
            }
        }
    }, [players, isInitialized]);

    // Закрытие контекстного меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setContextMenu({ show: false, x: 0, y: 0, playerId: 0 });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selected.length === players.length) {
            setSelected([]);
        } else {
            setSelected(players.map((p) => p.id));
        }
    };

    const handleTeamsCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTeamsCount(Number(e.target.value));
    };

    function shuffle<T>(array: T[]): T[] {
        return array
            .map((a) => [Math.random(), a] as [number, T])
            .sort((a, b) => a[0] - b[0])
            .map((a) => a[1]);
    }

    const splitTeams = () => {
        const selectedPlayers = players.filter((p) => selected.includes(p.id));
        // Сортируем по рейтингу, затем перемешиваем группы с близким рейтингом
        const sorted = [...selectedPlayers].sort((a, b) => b.rating - a.rating);
        const shuffled = shuffle(sorted);
        const newTeams: Player[][] = Array.from({ length: teamsCount }, () => []);
        shuffled.forEach((player, idx) => {
            newTeams[idx % teamsCount].push(player);
        });
        setTeams(newTeams);
        setShowTeams(true);
    };

    const openAddPlayerModal = () => {
        setEditingPlayer(null);
        setFormData({ name: "", nickname: "", rating: 5 });
        setShowModal(true);
    };

    const openEditPlayerModal = (player: Player) => {
        setEditingPlayer(player);
        setFormData({
            name: player.name,
            nickname: player.nickname,
            rating: player.rating
        });
        setShowModal(true);
        setContextMenu({ show: false, x: 0, y: 0, playerId: 0 });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Валидация
        if (!formData.name.trim()) {
            alert('Имя игрока обязательно для заполнения');
            return;
        }
        
        // Проверка уникальности имени
        const nameExists = players.some(p => 
            p.name.toLowerCase().trim() === formData.name.toLowerCase().trim() && 
            (!editingPlayer || p.id !== editingPlayer.id)
        );
        if (nameExists) {
            alert('Игрок с таким именем уже существует');
            return;
        }
        
        // Проверка уникальности ника (если указан)
        if (formData.nickname.trim()) {
            const nicknameExists = players.some(p => 
                p.nickname.toLowerCase().trim() === formData.nickname.toLowerCase().trim() && 
                (!editingPlayer || p.id !== editingPlayer.id)
            );
            if (nicknameExists) {
                alert('Игрок с таким ником уже существует');
                return;
            }
        }
        
        if (editingPlayer) {
            // Редактирование существующего игрока
            console.log('Редактируем игрока с ID:', editingPlayer.id);
            setPlayers(prev => prev.map(p => 
                p.id === editingPlayer.id 
                    ? { ...p, ...formData }
                    : p
            ));
        } else {
            // Добавление нового игрока
            const newPlayer: Player = {
                id: Date.now(),
                name: formData.name.trim(),
                nickname: formData.nickname.trim(),
                rating: formData.rating
            };
            console.log('Добавляем нового игрока:', newPlayer);
            setPlayers(prev => [...prev, newPlayer]);
        }
        setShowModal(false);
    };

    const deletePlayer = (playerId: number) => {
        console.log('Удаляем игрока с ID:', playerId);
        setPlayers(prev => {
            const newPlayers = prev.filter(p => p.id !== playerId);
            console.log('После удаления осталось игроков:', newPlayers.length);
            return newPlayers;
        });
        setSelected(prev => prev.filter(id => id !== playerId));
        setContextMenu({ show: false, x: 0, y: 0, playerId: 0 });
    };

    const handleContextMenu = (e: React.MouseEvent, playerId: number) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            playerId
        });
    };

    const getPlayerById = (id: number) => players.find(p => p.id === id);

    return (
        <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-start">
            <div className="max-w-4xl w-full bg-white/10 rounded shadow p-8 mt-12 flex flex-col items-center">
                <h1 className="text-4xl font-bold mb-8 text-center">Балансировщик команд</h1>
                <div className="w-full flex flex-col items-center mb-6">
                    <button
                        onClick={openAddPlayerModal}
                        className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 mb-6"
                    >
                        + Добавить игрока
                    </button>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-6">
                        <label className="font-medium text-lg">Количество команд:</label>
                        <input
                            type="number"
                            min={2}
                            max={players.length}
                            value={teamsCount}
                            onChange={handleTeamsCountChange}
                            className="border rounded px-4 py-2 w-20 text-center"
                        />
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4 sm:mt-0"
                            onClick={splitTeams}
                            disabled={selected.length < teamsCount}
                        >
                            Разделить на команды
                        </button>
                    </div>
                </div>
                {showTeams && teams.length > 0 && (
                    <div className="mb-8 w-full">
                        <h2 className="font-semibold mb-2 text-center">Составы команд:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {teams.map((team, idx) => (
                                <div key={idx} className="border rounded p-4 bg-white/20">
                                    <div className="font-bold mb-2 text-center">Команда {idx + 1}</div>
                                    <ul>
                                        {team.map((player) => (
                                            <li key={player.id} className="text-center">
                                                {player.name}
                                                {player.nickname && (
                                                    <> (<span className="text-gray-400">{player.nickname}</span>)</>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto w-full">
                    <table className="min-w-full border rounded bg-white/20">
                        <thead className="bg-gray-800/80 text-white">
                        <tr>
                            <th className="px-6 py-3 text-center"><input type="checkbox" checked={selected.length === players.length && players.length > 0} onChange={handleSelectAll} /></th>
                            <th className="px-6 py-3 text-center">#</th>
                            <th className="px-6 py-3 text-center">Имя</th>
                            <th className="px-6 py-3 text-center">Ник</th>
                            <th className="px-6 py-3 text-center">Рейтинг</th>
                            <th className="px-6 py-3 text-center">Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {players.map((player, idx) => (
                            <tr key={player.id} className={selected.includes(player.id) ? "bg-blue-900/20" : ""}>
                                <td className="px-6 py-3 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(player.id)}
                                        onChange={() => handleSelect(player.id)}
                                    />
                                </td>
                                <td className="px-6 py-3 text-center">{idx + 1}</td>
                                <td className="px-6 py-3 text-center">{player.name}</td>
                                <td className="px-6 py-3 text-center">{player.nickname || '-'}</td>
                                <td className="px-6 py-3 text-center">{player.rating}</td>
                                <td className="px-6 py-3 text-center">
                                    <button 
                                        className="px-3 py-1 rounded hover:bg-gray-200"
                                        onClick={(e) => handleContextMenu(e, player.id)}
                                    >
                                        ⋮
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selected.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow p-4 flex items-center justify-center z-50">
                    <span className="mr-4">Выбрано игроков: {selected.length}</span>
                    <input
                        type="number"
                        min={2}
                        max={selected.length}
                        value={teamsCount}
                        onChange={handleTeamsCountChange}
                        className="border rounded px-4 py-2 w-20 mr-4 text-center"
                    />
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        onClick={splitTeams}
                        disabled={selected.length < teamsCount}
                    >
                        Разделить на команды
                    </button>
                </div>
            )}
            {/* Контекстное меню */}
            {contextMenu.show && (
                <div
                    ref={contextMenuRef}
                    className="fixed bg-white border rounded shadow-lg z-50"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                    <button
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => {
                            const player = getPlayerById(contextMenu.playerId);
                            if (player) openEditPlayerModal(player);
                        }}
                    >
                        Редактировать
                    </button>
                    <button
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                        onClick={() => deletePlayer(contextMenu.playerId)}
                    >
                        Удалить
                    </button>
                </div>
            )}
            {/* Модальное окно */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingPlayer ? 'Редактировать игрока' : 'Добавить игрока'}
                        </h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Имя: <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Ник: <span className="text-gray-500">(опционально)</span></label>
                                <input
                                    type="text"
                                    value={formData.nickname}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Рейтинг: <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.rating}
                                    onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    {editingPlayer ? 'Сохранить' : 'Добавить'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;