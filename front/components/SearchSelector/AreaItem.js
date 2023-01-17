import React from 'react';

export default function AreaItem({name, parent_concat, ...props}) {
	return (
		<div className = "area-item_search-selector" {...props}>
			<div className = 'area-item_search-selector__header'>
				<p className = 'area-item_search-selector__header__title'>{name}</p>
				<p className = 'area-item_search-selector__header__type'>{!parent_concat ? 'Primary' : 'Secondary'}</p>
			</div>

			{!!parent_concat && (
				<div className = 'area-item_search-selector__footer'>
					{parent_concat.replace(/<->/g, ' > ')}
				</div>
			)}
		</div>
	);
}