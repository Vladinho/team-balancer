import React, { type FormEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';
import type { MultiValue } from 'react-select';
import type { PlayerFormData } from '../types/player';

interface Props {
    show: boolean;
    formData: PlayerFormData;
    onChange: (data: PlayerFormData & { tags: string[] }) => void;
    onSubmit: (e: FormEvent) => void;
    onClose: () => void;
    title: string;
    availableTags: string[];
}

export const PlayerModal: React.FC<Props> = ({
                                                 show,
                                                 formData,
                                                 onChange,
                                                 onSubmit,
                                                 onClose,
                                                 title,
                                                 availableTags,
                                             }) => {

    const tagOptions = availableTags.map(tag => ({ value: tag, label: tag }));
    const defaultValues = formData.tags?.map(tag => ({ value: tag, label: tag }));

    console.log(defaultValues, 'd')

    const handleSelectChange = (
        newValue: MultiValue<{ value: string; label: string }>,
    ) => {
        const tags = newValue.map(opt => opt.value);
        onChange({ ...formData, tags });
    };

    const handleCreateOption = (inputValue: string) => {
        const newTag = inputValue.trim();
        if (!newTag || formData.tags.includes(newTag)) return;
        onChange({ ...formData, tags: [...formData.tags, newTag] });
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Имя</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={e => onChange({ ...formData, name: e.target.value })}
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
                            onChange={e => onChange({ ...formData, nickname: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Рейтинг</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            max={100}
                            value={formData.rating}
                            onChange={e =>
                                onChange({
                                    ...formData,
                                    rating: e.target.value ? Number(e.target.value) : formData.rating,
                                })
                            }
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Теги</Form.Label>
                        <CreatableSelect
                            value={formData.tags.map(tag => ({ value: tag, label: tag }))}
                            isMulti
                            options={tagOptions}
                            defaultValue={defaultValues}
                            onChange={handleSelectChange}
                            onCreateOption={handleCreateOption}
                            placeholder="Выберите или создайте тег..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button variant="primary" type="submit">
                        {title}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};