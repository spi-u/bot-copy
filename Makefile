up:
	make save && docker-compose -f docker-compose.yml up -d --build
up-prod:
	make save && docker-compose -f docker-compose.prod.yml up -d --build
down:
	make save && docker-compose down
logs:
	docker logs --follow --tail 500 bot
ps-logs:
	docker logs --follow bot-db
admin-dev:
	docker exec -e NODE_ENV=development -e TG_ID -it bot sh -c "npm run admin"
admin-prod:
	docker exec -e NODE_ENV=production -e TG_ID -it bot sh -c "npm run admin"
save:
	sh ./utils/scripts/saveContracts.sh