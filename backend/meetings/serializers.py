from rest_framework import serializers

from .models import Meeting, AgendaItem, Minutes, Vote, Ballot


class AgendaItemSerializer(serializers.ModelSerializer):
    presenter_name = serializers.CharField(source="presenter.email", read_only=True)

    class Meta:
        model = AgendaItem
        fields = "__all__"
        read_only_fields = ["id"]


class MinutesSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.CharField(source="approved_by.email", read_only=True)
    created_by_name = serializers.CharField(source="created_by.email", read_only=True)

    class Meta:
        model = Minutes
        fields = "__all__"
        read_only_fields = ["id"]


class MeetingSerializer(serializers.ModelSerializer):
    agenda_items = AgendaItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source="created_by.email", read_only=True)
    has_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Meeting
        fields = "__all__"
        read_only_fields = ["id", "created_by"]

    def get_has_minutes(self, obj):
        return hasattr(obj, "minutes")


class MeetingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ["id", "title", "meeting_type", "date", "time", "location", "is_virtual", "status"]


class BallotSerializer(serializers.ModelSerializer):
    voter_name = serializers.CharField(source="voter.email", read_only=True)

    class Meta:
        model = Ballot
        fields = "__all__"
        read_only_fields = ["id", "cast_date", "voter"]


class VoteSerializer(serializers.ModelSerializer):
    ballots = BallotSerializer(many=True, read_only=True)
    results = serializers.SerializerMethodField()

    class Meta:
        model = Vote
        fields = "__all__"
        read_only_fields = ["id"]

    def get_results(self, obj):
        ballots = obj.ballots.all()
        return {
            "yes": ballots.filter(choice="yes").count(),
            "no": ballots.filter(choice="no").count(),
            "abstain": ballots.filter(choice="abstain").count(),
            "total": ballots.count(),
        }
