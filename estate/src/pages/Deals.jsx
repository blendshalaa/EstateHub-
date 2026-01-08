import React, { useEffect, useMemo } from 'react';
import { Plus, MoreHorizontal, DollarSign, Calendar } from 'lucide-react';
import useDealStore from '../store/dealStore';
import Button from '../components/common/Button';
import { formatCurrency, formatDate, getInitials } from '../utils/helpers';

const DealCard = ({ deal }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3">
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{deal.deal_name}</h4>
            <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
            </button>
        </div>

        <div className="flex items-center text-xs text-gray-500 mb-3">
            <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium mr-2 text-[10px]">
                {getInitials(deal.client_first_name, deal.client_last_name)}
            </div>
            <span>{deal.client_first_name} {deal.client_last_name}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-900">{formatCurrency(deal.offer_amount || deal.property_price)}</span>
            {deal.expected_close_date && (
                <span className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(deal.expected_close_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
            )}
        </div>
    </div>
);

const PipelineColumn = ({ title, deals, stage, count, totalValue }) => (
    <div className="flex-shrink-0 w-80 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">{title}</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">{count}</span>
            </div>
            {totalValue > 0 && (
                <span className="text-xs font-medium text-gray-500">{formatCurrency(totalValue)}</span>
            )}
        </div>
        <div className="flex-1 bg-gray-50/50 rounded-xl p-2 overflow-y-auto min-h-[200px]">
            {deals.map(deal => (
                <DealCard key={deal.id} deal={deal} />
            ))}
            {deals.length === 0 && (
                <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    No deals
                </div>
            )}
        </div>
    </div>
);

const Deals = () => {
    const { deals, isLoading, fetchDeals } = useDealStore();

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

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track and manage your active deals
                    </p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Deal
                </Button>
            </div>

            {/* Kanban Board */}
            {isLoading ? (
                <div className="flex justify-center items-center flex-1">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <div className="flex space-x-4 h-full min-w-max px-1">
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
            )}
        </div>
    );
};

export default Deals;
