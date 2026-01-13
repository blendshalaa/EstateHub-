import React, { useEffect, useMemo, useState } from 'react';
import { Plus, MoreHorizontal, DollarSign, Calendar, User, MapPin, ArrowRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useDealStore from '../store/dealStore';
import Button from '../components/common/Button';
import DealModal from '../components/deals/DealModal';
import { formatCurrency, formatDate, getInitials } from '../utils/helpers';

const DealCard = ({ deal, index }) => (
    <Draggable draggableId={deal.id.toString()} index={index}>
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`card p-4 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing mb-3 group ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary-500 ring-opacity-50 rotate-2' : ''
                    }`}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary-400 transition-colors">
                            {deal.deal_name}
                        </h4>
                        {deal.property_address && (
                            <div className="flex items-center text-[10px] text-gray-400 mt-0.5">
                                <MapPin className="w-3 h-3 mr-1 shrink-0" />
                                <span className="truncate">{deal.property_address}</span>
                            </div>
                        )}
                    </div>
                    <button className="text-primary-400 hover:text-white p-1 rounded-md hover:bg-primary-800 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold mr-2 text-[10px] shadow-sm">
                            {getInitials(deal.client_first_name, deal.client_last_name)}
                        </div>
                        <span className="text-xs font-medium text-primary-300">
                            {deal.client_first_name} {deal.client_last_name}
                        </span>
                    </div>
                    <div className="flex items-center text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <DollarSign className="w-3 h-3 mr-0.5" />
                        {formatCurrency(deal.offer_amount || deal.property_price)}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center text-[10px] text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {deal.expected_close_date
                            ? new Date(deal.expected_close_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                            : 'No date'}
                    </div>
                    <div className="flex -space-x-1">
                        <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] text-gray-400">
                            <User className="w-2.5 h-2.5" />
                        </div>
                    </div>
                </div>
            </div>
        )}
    </Draggable>
);

const PipelineColumn = ({ title, deals, stage, count, totalValue }) => (
    <div className="flex-shrink-0 w-80 flex flex-col h-full group/column">
        <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${stage === 'closed_won' ? 'bg-green-500' :
                    stage === 'closed_lost' ? 'bg-red-500' :
                        stage === 'under_contract' ? 'bg-blue-500' : 'bg-primary-500'
                    }`} />
                <h3 className="font-bold text-primary-100 text-sm tracking-tight">{title}</h3>
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {count}
                </span>
            </div>
            {totalValue > 0 && (
                <span className="text-xs font-bold text-gray-400">
                    {formatCurrency(totalValue)}
                </span>
            )}
        </div>

        <Droppable droppableId={stage}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-2xl p-3 transition-colors duration-200 min-h-[200px] ${snapshot.isDraggingOver ? 'bg-primary-50/50 ring-2 ring-primary-200 ring-inset' : 'bg-gray-50/50'
                        }`}
                >
                    {deals.map((deal, index) => (
                        <DealCard key={deal.id} deal={deal} index={index} />
                    ))}
                    {provided.placeholder}
                    {deals.length === 0 && !snapshot.isDraggingOver && (
                        <div className="h-32 border-2 border-dashed border-primary-800 rounded-xl flex flex-col items-center justify-center text-primary-400 text-xs space-y-2 group-hover/column:border-primary-700 transition-colors">
                            <div className="p-2 bg-primary-900/50 rounded-full shadow-sm">
                                <Plus className="w-4 h-4 text-gray-300" />
                            </div>
                            <span>No deals in {title}</span>
                        </div>
                    )}
                </div>
            )}
        </Droppable>
    </div>
);

const Deals = () => {
    const { deals, isLoading, fetchDeals, updateDealStage } = useDealStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchDeals();
    }, []);

    const stages = [
        { id: 'lead', label: 'Lead' },
        { id: 'viewing', label: 'Viewing' },
        { id: 'offer_made', label: 'Offer Made' },
        { id: 'negotiation', label: 'Negotiation' },
        { id: 'under_contract', label: 'Under Contract' },
        { id: 'closed_won', label: 'Closed Won' },
        { id: 'closed_lost', label: 'Closed Lost' }
    ];

    const groupedDeals = useMemo(() => {
        const groups = {};
        stages.forEach(stage => {
            groups[stage.id] = deals.filter(deal => deal.stage === stage.id);
        });
        return groups;
    }, [deals]);

    const getStageTotal = (stageId) => {
        return groupedDeals[stageId]?.reduce((sum, deal) => sum + Number(deal.offer_amount || 0), 0) || 0;
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const dealId = parseInt(draggableId);
        const newStage = destination.droppableId;

        updateDealStage(dealId, newStage);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Deal Pipeline</h1>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                        Manage your sales funnel and track progress
                        <ArrowRight className="w-3 h-3 mx-2 text-gray-300" />
                        <span className="text-primary-600 font-medium">{deals.length} Active Deals</span>
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="hidden md:flex items-center bg-primary-900/50 border border-primary-800 rounded-lg px-3 py-2 shadow-sm">
                        <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm font-bold text-primary-200">
                            {formatCurrency(deals.reduce((sum, d) => sum + Number(d.offer_amount || 0), 0))}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-2 uppercase font-bold tracking-wider">Total Volume</span>
                    </div>
                    <Button
                        className="shadow-lg shadow-primary-200"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Deal
                    </Button>
                </div>
            </div>

            <DealModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* Kanban Board */}
            {isLoading && deals.length === 0 ? (
                <div className="flex justify-center items-center flex-1">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 absolute top-0 left-0"></div>
                    </div>
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex-1 overflow-x-auto overflow-y-hidden pb-6 -mx-4 px-4 scrollbar-hide">
                        <div className="flex space-x-6 h-full min-w-max">
                            {stages.map(stage => (
                                <PipelineColumn
                                    key={stage.id}
                                    title={stage.label}
                                    stage={stage.id}
                                    deals={groupedDeals[stage.id] || []}
                                    count={groupedDeals[stage.id]?.length || 0}
                                    totalValue={getStageTotal(stage.id)}
                                />
                            ))}
                        </div>
                    </div>
                </DragDropContext>
            )}
        </div>
    );
};

export default Deals;
