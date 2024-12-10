/**
 * plant controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::plant.plant', ({ strapi }) => ({
    async create(ctx) {
        // Get the authenticated user ID
        const user = ctx.state.user;

        // Check if the user is authenticated
        if (!user) {
            return ctx.unauthorized('You must be logged in to create an plant.');
        }

        // Ensure the request body contains a data object
        if (!ctx.request.body.data) {
            ctx.request.body.data = {};
        }

        // Add the user ID to the request body
        ctx.request.body.data.user = user.id;

        // Call the default core create method with the updated request body
        const response = await super.create(ctx);
        return response;
    },

    async update(ctx) {
        // Get the authenticated user ID
        const user = ctx.state.user;

        // Check if the user is authenticated
        if (!user) {
            return ctx.unauthorized('You must be logged in to update this plant.');
        }
        // Fetch the plant to check ownership
        const { id } = ctx.params;
        const plant = await strapi.db.query('api::plant.plant').findOne({
            where: { documentId: id },
            populate: { user: true },
        });
        // Check if the authenticated user is the creator of the plant
        if (plant?.user?.id !== user.id) {
            return ctx.forbidden('You are not allowed to update this plant.');
        }

        // Proceed with the update
        const response = await super.update(ctx);
        return response;
    },
}));
