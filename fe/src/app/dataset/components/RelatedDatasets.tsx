"use client";

import { useActiveDatasets } from "@/hooks/dataset/useDataset";
import { Dataset } from "@/types";
import { DatasetCard } from "@/components/datasetCard";

export default function RelatedDatasets({ dataset }: { dataset: Dataset }) {
    const { data: all = [] } = useActiveDatasets();
    const related = all.filter(
        (ds) => ds.category_id === dataset.category_id && ds.dataset_id !== dataset.dataset_id
    );

    if (related.length === 0) return null;

    return (
        <section className="pt-6">
            <h3 className="text-2xl font-bold text-gray-100 mb-6">
                🔗 Dataset liên quan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.slice(0, 3).map((ds) => (
                    <DatasetCard
                        key={ds.dataset_id}
                        dataset={ds}
                        onView={() => (window.location.href = `/dataset/${ds.dataset_id}`)}
                        className="hover:scale-105 transition-all duration-300"
                    />
                ))}
            </div>
        </section>
    );
}
